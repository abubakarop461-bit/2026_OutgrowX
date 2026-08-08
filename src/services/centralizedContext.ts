import { knowledgeService } from './knowledgeService';

export interface CentralizedContextState {
  userRole: 'Homeowner' | 'Landowner' | 'Solar Vendor' | string;
  onboarding: {
    name?: string;
    companyName?: string;
    gstin?: string;
    licenseNo?: string;
    state: string;
    discom: string;
    city?: string;
    billAmount: number;
    roofArea: number;
  };
  billScanner: {
    scannedAt?: string;
    unitsConsumed: number;
    billAmount: number;
    discom: string;
    consumerCategory: string;
  };
  applianceCalculator: {
    calculatedAt?: string;
    totalMonthlyKWh: number;
    topAppliance: string;
    seasonalHours: { summer: number; monsoon: number; winter: number };
  };
  propertyAssessment: {
    assessedAt?: string;
    roofAreaSqFt: number;
    roofSolarScore: number;
    landAcres?: number;
    estimatedCapacityMW?: number;
  };
  lastUpdated: string;
}

const STORAGE_KEY = 'suryx_centralized_context_engine';

export function getCentralizedContext(profile?: any): CentralizedContextState {
  const fallback: CentralizedContextState = {
    userRole: profile?.userType || profile?.userRole || 'Homeowner',
    onboarding: {
      name: profile?.name || profile?.firstName || 'User',
      companyName: profile?.companyName || '',
      gstin: profile?.gstin || '',
      licenseNo: profile?.licenseNo || '',
      state: profile?.state || 'Maharashtra',
      discom: profile?.discom || 'MSEDCL',
      city: profile?.city || 'Pune',
      billAmount: Number(profile?.billAmount || profile?.avgBill || profile?.billSize || 3200),
      roofArea: Number(profile?.roofArea || profile?.roofSqFt || 800),
    },
    billScanner: {
      unitsConsumed: 0,
      billAmount: 0,
      discom: profile?.discom || 'MSEDCL',
      consumerCategory: 'Residential',
    },
    applianceCalculator: {
      totalMonthlyKWh: 0,
      topAppliance: 'Air Conditioner',
      seasonalHours: { summer: 8, monsoon: 5, winter: 3 },
    },
    propertyAssessment: {
      roofAreaSqFt: Number(profile?.roofArea || profile?.roofSqFt || 800),
      roofSolarScore: 88,
    },
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (profile) {
      parsed.userRole = profile.userType || profile.userRole || parsed.userRole || 'Homeowner';
      parsed.onboarding.name = profile.name || profile.firstName || parsed.onboarding.name;
      parsed.onboarding.state = profile.state || parsed.onboarding.state;
      parsed.onboarding.discom = profile.discom || parsed.onboarding.discom;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveCentralizedContext(state: CentralizedContextState) {
  if (typeof window === 'undefined') return;
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save Centralized Context Engine state:', e);
  }
}

export function recordBillScanAction(billData: any, profile?: any) {
  const current = getCentralizedContext(profile);
  const updated: CentralizedContextState = {
    ...current,
    billScanner: {
      scannedAt: new Date().toISOString(),
      unitsConsumed: billData.unitsConsumed || Math.round(billData.billAmount / 9.5),
      billAmount: billData.billAmount || 0,
      discom: billData.discom || current.onboarding.discom,
      consumerCategory: billData.consumerCategory || 'Residential',
    },
    onboarding: {
      ...current.onboarding,
      billAmount: billData.billAmount || current.onboarding.billAmount,
      discom: billData.discom || current.onboarding.discom,
    }
  };
  saveCentralizedContext(updated);
  return updated;
}

export function recordApplianceCalculatorAction(appliances: any[], hours: any, totalKWh: number, profile?: any) {
  const current = getCentralizedContext(profile);
  const activeDevs = appliances.filter(a => (a.quantity || 0) > 0);
  const topDev = activeDevs.sort((a, b) => (b.wattage * (b.quantity || 1)) - (a.wattage * (a.quantity || 1)))[0];

  const updated: CentralizedContextState = {
    ...current,
    applianceCalculator: {
      calculatedAt: new Date().toISOString(),
      totalMonthlyKWh: totalKWh,
      topAppliance: topDev ? topDev.name : 'Air Conditioner',
      seasonalHours: hours,
    }
  };
  saveCentralizedContext(updated);
  return updated;
}

export function recordPropertyAssessmentAction(assessmentData: any, profile?: any) {
  const current = getCentralizedContext(profile);
  const updated: CentralizedContextState = {
    ...current,
    propertyAssessment: {
      assessedAt: new Date().toISOString(),
      roofAreaSqFt: assessmentData.roofArea || current.onboarding.roofArea,
      roofSolarScore: assessmentData.score || current.propertyAssessment.roofSolarScore || 88,
      landAcres: assessmentData.acres,
      estimatedCapacityMW: assessmentData.capacityMW,
    }
  };
  saveCentralizedContext(updated);
  return updated;
}

/**
 * Builds the Master System Prompt for the SuryaSetu Solar Advisor AI Chatbot.
 * Dynamically injects live Centralized Context Engine signals (Bill Scans, Appliance Load, Property, Onboarding)
 * alongside RAG Knowledge Base context and strict Master Prompt Standards.
 */
export function buildCentralizedSystemPrompt(
  profile: any,
  userQuery: string = '',
  lang: string = 'en',
  blogArticles?: any[]
): string {
  const ctx = getCentralizedContext(profile);
  const role = ctx.userRole || 'Homeowner';
  const name = ctx.onboarding.name || profile?.firstName || profile?.name || 'User';

  const langInstruction = lang === 'hi'
    ? 'You MUST respond entirely in Hindi using Devanagari script (including all headers and terms).'
    : lang === 'mr'
      ? 'You MUST respond entirely in Marathi using Devanagari script (including all headers and terms).'
      : 'You MUST respond in clear, professional English by default.';

  // RAG Knowledge Base context retrieval (including RSS blog feeds)
  const ragContext = knowledgeService.getPromptContext(userQuery, blogArticles);

  // Active Scanned / Calculated Context Signals
  const scannerSignals = ctx.billScanner.scannedAt
    ? `Scanned Bill: ${ctx.billScanner.unitsConsumed} kWh | ₹${ctx.billScanner.billAmount.toLocaleString('en-IN')} | DISCOM: ${ctx.billScanner.discom}`
    : `Onboarding Monthly Bill: ₹${(ctx.onboarding.billAmount || 3200).toLocaleString('en-IN')} | DISCOM: ${ctx.onboarding.discom}`;

  const loadSignals = ctx.applianceCalculator.calculatedAt
    ? `Appliance Load Model: ${ctx.applianceCalculator.totalMonthlyKWh} kWh/mo | Top Load: ${ctx.applianceCalculator.topAppliance}`
    : `Estimated Load Baseline: ~${((ctx.onboarding.billAmount || 3200) / 9.5).toFixed(0)} kWh/mo`;

  const propertySignals = ctx.propertyAssessment.assessedAt
    ? `Property Assessment: ${ctx.propertyAssessment.roofAreaSqFt} sq ft roof | Score: ${ctx.propertyAssessment.roofSolarScore}/100`
    : `Onboarding Roof Baseline: ${ctx.onboarding.roofArea || 800} sq ft`;

  return `# SuryaSetu Solar Advisor — Master System Prompt

## 1. IDENTITY & MISSION
You are **SuryaSetu Solar Advisor**, India's premier AI-powered regional solar intelligence expert, built on a Centralized Context Engine that unifies Onboarding data, Bill Scans, Appliance Load Models, and Property Assessments.

Your job is not to answer questions — it is to produce a **decision-ready personal solar brief** every time a user asks something. Every response should leave the user able to act (apply, calculate, negotiate, or decide) without needing to ask a follow-up just to get basic numbers.

${langInstruction}

---

## 2. NON-NEGOTIABLE RESPONSE STANDARDS
1. **Never give a one-line or single-paragraph answer to a substantive question.** Include: the number, the formula/reasoning behind it, how it was personalized to this user's recorded signals, and a next step.
2. **Always show the math.** Never state a final ₹ figure without showing the calculation that produced it (rate × quantity = result).
3. **Always personalize.** Pull the user's actual recorded signals (bill kWh, ₹ amount, DISCOM, roof sq ft, property score, load model, top appliances) into the answer by name.
4. **Default to structured Markdown** — headers (##/###), bold key figures, and tables for any comparison or multi-line calculation.
5. **Anticipate the next three questions.** If a user asks "how much subsidy do I get," proactively also cover system sizing, roof fit, and the immediate next action.
6. **End every substantive answer with a clear "Next Step" or a single, focused clarifying question.**
7. **Minimum depth bar:** Substantive queries should read as a mini-briefing (150–350 words or equivalent structured block).

---

## 3. UNIFIED CENTRALISED CONTEXT ENGINE STATE (GROUND TRUTH)
- **Active User Name:** ${name} ${ctx.onboarding.companyName ? `(${ctx.onboarding.companyName})` : ''}
- **User Role Pathway:** ${role}
- **Location & Utility:** ${ctx.onboarding.state} | DISCOM: ${ctx.onboarding.discom} | City: ${ctx.onboarding.city || 'State Capital'}
- **Recorded Bill Signals:** ${scannerSignals}
- **Recorded Load Signals:** ${loadSignals}
- **Recorded Property Signals:** ${propertySignals}
${ctx.onboarding.gstin ? `- **Business GSTIN:** ${ctx.onboarding.gstin} | **License:** ${ctx.onboarding.licenseNo}` : ''}

### 3.1 Signal Reconciliation Protocol
If Bill Scan (e.g., ${ctx.billScanner.unitsConsumed || 235} kWh) and Appliance Load Model (e.g., ${ctx.applianceCalculator.totalMonthlyKWh || 420} kWh) differ:
- Explicitly flag the gap to ${name}.
- Explain the cause (e.g., newly added ACs or seasonal summer surge).
- Size around the higher forward-looking figure by default while offering the conservative bill-based size as an alternative.

---

## 4. UNIVERSAL CALCULATION TOOLKIT
- **Roof space:** ~107 sq ft per 1 kW installed.
- **Roof capacity max:** Roof area (${ctx.propertyAssessment.roofAreaSqFt || ctx.onboarding.roofArea || 800} sq ft) ÷ 107.
- **Load-driven size:** Monthly kWh ÷ (4.2 units/kWp/day × 30).
- **PM Surya Ghar Subsidy:** ₹30,000 for 1 kW | ₹60,000 for 2 kW | ₹78,000 max for 3 kW+. Disbursed via DBT after commissioning. Requires ALMM & BIS compliance.
- **PM-KUSUM (Landowners):** Component A (0.5–2 MW feeder plant, ~4-5 acres/MW, <5 km from 11/33kV substation, 25-yr PPA), Component B (off-grid solar pumps 2-10 HP, 60% subsidy), Component C (feeder solarization). Lease income: ₹60,000–₹1,00,000/acre/year or ₹2.2–4.0 Lakh/MW/year.

---

## 5. INJECTED KNOWLEDGE BASE & POLICY CURRENCY
${ragContext}

---

## 6. RESPONSE TEMPLATES BY QUERY INTENT
When user asks about cost/subsidy/savings, structure as:
## [Direct headline number, e.g., "${name}, Your 3.5 kW Solar Math for ${ctx.onboarding.state}"]
### Your Numbers & Math
(Show sizing formula, gross cost, subsidy deduction, net investment, monthly bill offset math, payback years)
### Why This Fits You
(Tie directly to ${ctx.onboarding.discom}, ${ctx.onboarding.roofArea || 800} sq ft roof, and recorded load signals)
### Next Step
(Single actionable next step)
`;
}
