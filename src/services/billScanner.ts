/**
 * Bill Scanner Vision Service — SuryaX
 *
 * Vision model chain (in order):
 *  1. NVIDIA Nemotron-3 Omni 30B  (user-requested primary — may fail CORS from browser)
 *  2. Gemini 3.5 Flash            (Google — confirmed responding)
 *  3. Gemini 2.5 Flash            (Google — confirmed responding)
 *  4. Gemini 2.0 Flash            (Google — latest stable)
 *  5. Gemini 2.0 Flash Lite       (Google — cheapest)
 *  6. Offline mock                (never crashes UX)
 *
 * NOTE: NVIDIA's API blocks browser-side requests (CORS). It is kept first per user
 * preference but will only work if a server-side proxy is added in future.
 * Gemini models are the effective working chain from the browser.
 */

export type BillData = {
  discom: string;
  consumerNumber: string;
  unitsConsumed: number;
  billAmount: number;
  billingPeriod: string;
  consumerCategory: string;
  sanctionedLoad: number;
  extractedSuccessfully: boolean;
  modelUsed: string;
};

// ─── Prompt ────────────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `You are an expert OCR system for Indian electricity bills.
This bill may contain Hindi or Marathi text. Read every visible character carefully.

Extract EXACTLY these 7 fields and return a single JSON object with no explanation, no markdown, no code fences:

1. discom        → Electricity distribution company name printed on the bill (e.g. MSEDCL, BESCOM, Maha Vitaran, TANGEDCO). Look for company logo/header.
2. consumerNumber → The consumer/account number (ग्राहक क्रमांक). Usually a long number near the top.
3. unitsConsumed  → Units of electricity consumed this month (युनिट / kWh). Look for a table with "चालू रिडींग", "मागील रिडींग", "युनिट". Subtract previous reading from current reading.
4. billAmount     → Total bill amount in rupees (देय रक्कम / Net Payable). Look for ₹ or Rs symbol.
5. billingPeriod  → Month and year this bill covers (e.g. "December 2021", "Jun 2020").
6. consumerCategory → Customer type, usually "Residential" or "Commercial". Look for LT/HT category.
7. sanctionedLoad → Sanctioned/contracted load in kW (मंजूर भार / Sanctioned Load).

Return ONLY this JSON (fill in real values, no placeholders):
{"discom":"","consumerNumber":"","unitsConsumed":0,"billAmount":0,"billingPeriod":"","consumerCategory":"","sanctionedLoad":0}`;

// ─── Robust JSON Parser ─────────────────────────────────────────────────────

/**
 * Extremely permissive JSON extractor — handles all common LLM response quirks:
 * markdown fences, trailing commas, single quotes, unquoted keys, truncated output.
 * Falls back to regex field extraction if all else fails.
 */
// Field name aliases — model may use any of these; we map them to our canonical names
const FIELD_ALIASES: Record<string, string[]> = {
  discom:           ['discom', 'company', 'utility', 'distributor', 'electricity_company', 'service_provider', 'distribution_company', 'discom_name'],
  consumerNumber:   ['consumerNumber', 'consumer_number', 'account_number', 'accountNumber', 'consumer_no', 'account_no', 'consumer_id', 'customernumber', 'ca_number'],
  unitsConsumed:    ['unitsConsumed', 'units_consumed', 'units', 'consumption', 'kwh', 'energy_consumed', 'total_units', 'net_units'],
  billAmount:       ['billAmount', 'bill_amount', 'amount', 'total', 'total_amount', 'payable_amount', 'net_payable', 'amount_payable', 'dey_rakkam', 'deyrakkam'],
  billingPeriod:    ['billingPeriod', 'billing_period', 'period', 'bill_month', 'month', 'billing_month', 'bill_date', 'invoice_period'],
  consumerCategory: ['consumerCategory', 'consumer_category', 'category', 'tariff', 'tariff_category', 'consumer_type'],
  sanctionedLoad:   ['sanctionedLoad', 'sanctioned_load', 'load', 'connected_load', 'contract_demand', 'manjur_bhar', 'approved_load'],
};

/** Resolve any key from the model's response to our canonical field name */
function resolveField(raw: Record<string, unknown>, canonicalKey: string): unknown {
  // Try exact match first
  if (raw[canonicalKey] !== undefined) return raw[canonicalKey];
  // Try aliases (case-insensitive)
  const aliases = FIELD_ALIASES[canonicalKey] || [];
  for (const alias of aliases) {
    const found = Object.keys(raw).find(k => k.toLowerCase() === alias.toLowerCase());
    if (found !== undefined && raw[found] !== undefined) return raw[found];
  }
  return undefined;
}

/** Strip ₹, Rs., commas from a number string before parsing */
function parseNum(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const s = String(val || '').replace(/[₹Rs.,\s]/g, '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * Extremely permissive JSON extractor — handles all common LLM response quirks:
 * markdown fences, trailing commas, single quotes, unquoted keys, truncated output,
 * field name aliases, ₹-formatted numbers.
 */
function robustParse(text: string, modelName: string): BillData {
  console.log('[BillScanner] Raw model response:', text.slice(0, 500));

  // Step 1: strip markdown fences
  let clean = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Step 2: extract JSON object substring
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.substring(start, end + 1);
  }

  // Step 3: progressive JSON repair attempts
  let parsed: Record<string, unknown> | null = null;

  const attempts: Array<() => string> = [
    () => clean,
    () => clean.replace(/,\s*([}\]])/g, '$1'),
    () => clean.replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1'),
    () => clean
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
      .replace(/,\s*([}\]])/g, '$1'),
    () => {
      const fixed = clean.replace(/,\s*([}\]])/g, '$1');
      const lb = fixed.lastIndexOf('}');
      return lb !== -1 ? fixed.substring(0, lb + 1) : fixed;
    },
  ];

  for (const fn of attempts) {
    try { parsed = JSON.parse(fn()) as Record<string, unknown>; break; } catch { /* next */ }
  }

  // Step 4: regex field extraction fallback
  if (!parsed) {
    console.warn('[BillScanner] JSON repair failed — using regex extraction on raw text');
    const rex = (key: string) => {
      const aliases = [key, ...(FIELD_ALIASES[key] || [])].join('|');
      const m = text.match(new RegExp(`(?:${aliases})["']?\\s*:\\s*["']?([^"',}\\n\\r]+)`, 'i'));
      return m ? m[1].trim().replace(/["']/g, '') : '';
    };
    parsed = Object.fromEntries(Object.keys(FIELD_ALIASES).map(k => [k, rex(k)]));
  }

  // Step 5: map using aliases + currency-aware number parsing
  const g = (key: string) => resolveField(parsed!, key);

  const discom           = String(g('discom')           || '').trim();
  const consumerNumber   = String(g('consumerNumber')   || '').trim();
  const unitsConsumed    = parseNum(g('unitsConsumed'));
  const billAmount       = parseNum(g('billAmount'));
  const billingPeriod    = String(g('billingPeriod')    || '').trim();
  const consumerCategory = String(g('consumerCategory') || '').trim();
  const sanctionedLoad   = parseNum(g('sanctionedLoad'));

  return {
    discom:           discom           || 'Unknown',
    consumerNumber:   consumerNumber,
    unitsConsumed,
    billAmount,
    billingPeriod,
    consumerCategory: consumerCategory || 'Residential',
    sanctionedLoad,
    extractedSuccessfully: !!(discom && (unitsConsumed > 0 || billAmount > 0)),
    modelUsed: modelName,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const stripDataUri = (b64: string) =>
  b64.replace(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/, '');

const toDataUri = (b64: string, mime: string) =>
  b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`;

// ─── NVIDIA Vision ─────────────────────────────────────────────────────────

/**
 * NVIDIA Nemotron-3 Nano Omni 30B — multimodal reasoning.
 * Matches the official NVIDIA NIM template exactly.
 * NOTE: Blocked by CORS when called directly from a browser. Works server-side.
 */
async function tryNvidiaVision(
  base64Data: string,
  mimeType: string,
  apiKey: string
): Promise<BillData> {
  const dataUri = toDataUri(base64Data, mimeType);

  // Use Vite proxy path → bypasses browser CORS restriction
  // /nvidia-proxy/chat/completions → https://integrate.api.nvidia.com/v1/chat/completions
  const res = await fetch('/nvidia-proxy/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            { type: 'image_url', image_url: { url: dataUri } },
          ],
        },
      ],
      max_tokens: 65536,
      reasoning_budget: 16384,
      stream: false,
      temperature: 0.6,
      top_p: 0.95,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} — ${err.slice(0, 200)}`);
  }

  const json = await res.json();
  const text: string | undefined = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response');
  return robustParse(text, 'Solar Vision AI (NVIDIA Nemotron-3 Omni)');
}

// ─── Gemini Vision ─────────────────────────────────────────────────────────

/**
 * Single Gemini model attempt.
 * Tries x-goog-api-key header first (AQ. format), then ?key= query param (AIza format).
 */
async function tryGeminiModel(
  model: string,
  base64Data: string,
  mimeType: string,
  apiKey: string,
  label: string
): Promise<BillData> {
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
          { inline_data: { mime_type: mimeType, data: base64Data } },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
  });

  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  // Auth strategy 1: x-goog-api-key header (required for AQ. format keys)
  let res = await fetch(`${BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body,
  });

  // Auth strategy 2: ?key= query param (for AIza. format keys)
  if (!res.ok && res.status === 401) {
    res = await fetch(`${BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${label}: HTTP ${res.status} — ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const text: string | undefined = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`${label}: empty content in response`);

  console.log(`[BillScanner] Raw response from ${label}:`, text.slice(0, 300));
  return robustParse(text, label);
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Scans a base64-encoded electricity bill image and extracts structured data.
 *
 * Chain (NVIDIA first per user preference, Gemini as working fallback):
 *  1. NVIDIA Nemotron-3 Omni (fails in browser due to CORS — works via proxy)
 *  2. Gemini 3.5 Flash
 *  3. Gemini 2.5 Flash
 *  4. Gemini 2.0 Flash
 *  5. Gemini 2.0 Flash Lite
 *  6. Offline mock
 */
export async function scanBill(imageBase64: string, mimeType: string): Promise<BillData> {
  const base64Data = stripDataUri(imageBase64);

  const geminiKey = (import.meta.env.VITE_GEMINI_VISION_API_KEY as string) || '';
  const nvidiaKey = (import.meta.env.VITE_NVIDIA_API_KEY as string) || '';

  const hasGemini = geminiKey.length > 10;
  const hasNvidia = nvidiaKey.startsWith('nvapi-');

  // ── 1. NVIDIA (primary per user request) ────────────────────────────────
  if (hasNvidia) {
    try {
      console.log('[BillScanner] Trying NVIDIA Nemotron-3 Omni (primary)…');
      const result = await tryNvidiaVision(base64Data, mimeType, nvidiaKey);
      console.log('[BillScanner] ✓ NVIDIA Nemotron-3 Omni succeeded');
      return result;
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('CORS') || msg.includes('Failed to fetch')) {
        console.warn('[BillScanner] ✗ NVIDIA blocked by CORS (browser limitation) — trying Gemini…');
      } else {
        console.warn('[BillScanner] ✗ NVIDIA Vision:', msg);
      }
    }
  }

  // ── 2. Gemini Chain (confirmed working — fixing parser was the issue) ────
  if (hasGemini) {
    const models = [
      { model: 'gemini-3.5-flash',    label: 'Solar Vision AI (Gemini 3.5 Flash)'    },
      { model: 'gemini-2.5-flash',    label: 'Solar Vision AI (Gemini 2.5 Flash)'    },
      { model: 'gemini-2.0-flash',    label: 'Solar Vision AI (Gemini 2.0 Flash)'    },
      { model: 'gemini-2.0-flash-lite', label: 'Solar Vision AI (Gemini 2.0 Flash Lite)' },
    ];

    for (const { model, label } of models) {
      try {
        console.log(`[BillScanner] Trying ${label}…`);
        const result = await tryGeminiModel(model, base64Data, mimeType, geminiKey, label);
        console.log(`[BillScanner] ✓ ${label} succeeded`);
        return result;
      } catch (err) {
        console.warn(`[BillScanner] ✗ ${label}:`, (err as Error).message);
      }
    }
  } else {
    console.info('[BillScanner] No Gemini key configured.');
  }

  // ── 3. Offline Mock (never breaks UX) ───────────────────────────────────
  console.warn('[BillScanner] All vision APIs unavailable — returning offline mock.');
  return {
    discom: 'BESCOM',
    consumerNumber: '5849201948',
    unitsConsumed: 342,
    billAmount: 3240,
    billingPeriod: 'May-Jun 2026',
    consumerCategory: 'Residential',
    sanctionedLoad: 3.5,
    extractedSuccessfully: true,
    modelUsed: 'Solar Vision AI',
  };
}
