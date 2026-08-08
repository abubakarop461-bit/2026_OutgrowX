import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  UploadCloud, CheckCircle, Info, Sparkles, Send, Cpu, Layers,
  Trash2, Receipt, Clock, FileText
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { PieChart } from '../../components/ui/bklit';
import { chatStream, Message } from '../../services/ai';
import { buildSolarAdvisorPrompt, MODEL_LABELS } from '../../services/prompts';
import { scanBill, BillData } from '../../services/billScanner';
import { APPLIANCES } from '../../data/applianceProfiles';
import {
  recordBillScanAction,
  recordApplianceCalculatorAction,
  getCentralizedContext
} from '../../services/centralizedContext';
import { localDB, DBScannedBill } from '../../services/localDatabase';
import './SolarAI.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const SolarAI: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'bill' | 'calculator' | 'advisor'>('bill');

  return (
    <div className="solar-ai-page" style={{ paddingTop: '24px' }}>
      <main className="container pb-12">
        {/* Tab Navigation */}
        <div className="vai-tabs">
          <button
            className={`vai-tab-btn ${activeTab === 'bill' ? 'vai-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('bill')}
          >
            Bill Scanner AI
          </button>
          <button
            className={`vai-tab-btn ${activeTab === 'calculator' ? 'vai-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Appliance Load AI
          </button>
          <button
            className={`vai-tab-btn ${activeTab === 'advisor' ? 'vai-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('advisor')}
          >
            AI Advisor Chat
          </button>
        </div>

        {activeTab === 'bill' && <BillScanner onNavigateToAdvisor={() => setActiveTab('advisor')} />}
        {activeTab === 'calculator' && <ApplianceCalculator />}
        {activeTab === 'advisor' && <AIAdvisor />}
      </main>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   BILL SCANNER
═══════════════════════════════════════════════════ */
const BillScanner: React.FC<{ onNavigateToAdvisor?: () => void }> = ({ onNavigateToAdvisor }) => {
  const { userProfile, setProfile } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<BillData | null>(null);
  const [error, setError] = useState('');
  const [savedBills, setSavedBills] = useState<DBScannedBill[]>([]);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = userProfile.email || userProfile.phone || 'default_user';
  const role = userProfile.userType || userProfile.userRole || 'Homeowner';

  const loadSavedBills = useCallback(async () => {
    try {
      const bills = await localDB.getAllScannedBills(userId);
      setSavedBills(bills);
    } catch (e) { console.error('Error loading bills:', e); }
  }, [userId]);

  useEffect(() => { loadSavedBills(); }, [loadSavedBills]);

  const processFile = async (file: File) => {
    setScanning(true); setError(''); setResult(null); setAppliedSuccess(false);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const mimeType = file.type || 'image/jpeg';
        try {
          const data = await scanBill(base64, mimeType);
          setResult(data);
          const saved = await localDB.saveScannedBill({
            userId, filename: file.name,
            discom: data.discom, consumerNumber: data.consumerNumber,
            unitsConsumed: data.unitsConsumed, billAmount: data.billAmount,
            billingPeriod: data.billingPeriod, consumerCategory: data.consumerCategory,
            sanctionedLoad: data.sanctionedLoad, modelUsed: data.modelUsed, base64Image: base64,
          });
          setSelectedBillId(saved.id);
          recordBillScanAction(data, userProfile);
          await loadSavedBills();
        } catch {
          setError('AI OCR scan failed. Please try a clearer image.');
        } finally { setScanning(false); }
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to read file.'); setScanning(false);
    }
  };

  const handleApplyData = (billToApply?: BillData | DBScannedBill) => {
    const target = billToApply || result;
    if (!target) return;
    const dataToApply: BillData = {
      discom: target.discom, consumerNumber: target.consumerNumber,
      unitsConsumed: target.unitsConsumed, billAmount: target.billAmount,
      billingPeriod: target.billingPeriod, consumerCategory: target.consumerCategory || 'Residential',
      sanctionedLoad: (target as any).sanctionedLoad || 3.5,
      extractedSuccessfully: true, modelUsed: (target as any).modelUsed || 'IndexedDB Store'
    };
    setResult(dataToApply);
    setProfile({ billAmount: dataToApply.billAmount, avgBill: dataToApply.billAmount, discom: dataToApply.discom });
    recordBillScanAction(dataToApply, userProfile);
    setAppliedSuccess(true);
  };

  const handleDeleteBill = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await localDB.deleteScannedBill(id);
    if (selectedBillId === id) setSelectedBillId(null);
    await loadSavedBills();
  };

  return (
    <div className="vai-grid-2">
      <div className="vai-stack">
        {/* Upload Zone */}
        <div
          className={`vai-upload-zone ${isDragging ? 'vai-upload-zone--dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          <UploadCloud size={40} className="vai-upload-icon" />
          <h3 className="vai-upload-title">Upload Electricity Bill</h3>
          <p className="vai-upload-sub">Drag & drop your bill image or PDF, or click to browse</p>
          <span className="vai-tag vai-tag--ember">AI OCR Vision Powered</span>
        </div>

        {scanning && (
          <div className="vai-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px' }}>
            <span className="vai-spinner" />
            <span style={{ fontSize: '14px', color: 'var(--vai-steel)' }}>Scanning with AI OCR Vision Model…</span>
          </div>
        )}

        {error && <div className="vai-error">{error}</div>}

        {result && (
          <div className="vai-card--white" style={{ border: appliedSuccess ? '1px solid #bbf7d0' : '1px solid var(--vai-mist)' }}>
            <div className="vai-section-label" style={{ marginBottom: '16px' }}>
              <span className="vai-section-title" style={{ color: '#16a34a' }}>
                <CheckCircle size={16} /> Extracted Bill Data
              </span>
              <span className="vai-tag vai-tag--success">Recorded in AI Context Engine</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              {[
                ['DISCOM', result.discom],
                ['Consumer No.', result.consumerNumber],
                ['Units Consumed', `${result.unitsConsumed} kWh`],
                ['Bill Amount', `₹${result.billAmount.toLocaleString('en-IN')}`],
                ['Category', result.consumerCategory],
                ['Billing Period', result.billingPeriod],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: 'var(--vai-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: label === 'Bill Amount' ? 'var(--vai-ember)' : 'var(--vai-graphite)' }}>{val}</div>
                </div>
              ))}
            </div>

            <button
              className={`vai-btn-primary ${appliedSuccess ? 'vai-btn-primary--success' : ''}`}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
              onClick={() => handleApplyData()}
            >
              <CheckCircle size={16} />
              {appliedSuccess ? 'Applied to AI Context Engine ✓' : 'Apply Data to Centralized AI Context'}
            </button>

            {appliedSuccess && (
              <div className="vai-card--success">
                <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', marginBottom: '4px' }}>✓ Context Engine Updated</div>
                <div style={{ fontSize: '13px', color: 'var(--vai-steel)', marginBottom: '8px' }}>
                  {result.discom} bill (₹{result.billAmount.toLocaleString('en-IN')}) synced across all 3 AI tools, ROI models, and AI Advisor.
                </div>
                <button className="vai-link" onClick={onNavigateToAdvisor}>Open AI Advisor Chat →</button>
              </div>
            )}
          </div>
        )}

        {/* Saved Bills Library */}
        <div className="vai-card--white">
          <div className="vai-section-label">
            <span className="vai-section-title">
              <Receipt size={16} style={{ color: 'var(--vai-ember)' }} />
              Bill Library ({savedBills.length})
            </span>
            <span className="vai-section-meta">IndexedDB Store</span>
          </div>

          {savedBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '13px', color: 'var(--vai-slate)' }}>
              No bills saved yet. Upload a bill to build your relational history.
            </div>
          ) : (
            <div className="vai-stack" style={{ gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {savedBills.map((b) => (
                <div
                  key={b.id}
                  className={`vai-bill-item ${selectedBillId === b.id ? 'vai-bill-item--active' : ''}`}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                      <span className="vai-bill-label">{b.discom}</span>
                      <span className="vai-bill-amount">₹{b.billAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="vai-bill-meta">
                      <span>{b.unitsConsumed} kWh</span>
                      <span>·</span>
                      <span>{b.billingPeriod}</span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        {new Date(b.scannedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      className="vai-btn-ghost"
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => { setSelectedBillId(b.id); handleApplyData(b); }}
                    >
                      Apply
                    </button>
                    <button
                      className="vai-btn-ghost"
                      style={{ padding: '5px 8px', borderColor: '#fecaca', color: '#dc2626' }}
                      onClick={(e) => handleDeleteBill(b.id, e)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Role Insight */}
      <div className="vai-stack">
        <div className="vai-card--ivory">
          <div className="vai-insight-label">Personalized Role Insight</div>
          <p className="vai-insight-text">
            {role === 'Landowner'
              ? 'Bill scans establish baseline power tariffs for agricultural solar feeder projects under PM-KUSUM Component A/C.'
              : role === 'Solar Vendor'
              ? 'Client bill OCR scans automatically structure customer quotes, tariff slab offsets, and DISCOM net-metering application forms.'
              : 'Your monthly bill determines exact kW solar PV sizing, PM Surya Ghar subsidy tiers (up to ₹78,000), and 25-year cumulative savings.'}
          </p>
        </div>

        <div className="vai-card--white">
          <div className="vai-insight-label">Supported DISCOMs</div>
          <p className="vai-insight-text" style={{ fontSize: '13px' }}>
            MSEDCL · TANGEDCO · BESCOM · UGVCL · JVVNL · BSES · PSPCL · KSEB · WBSEDCL · DHBVN · UHBVN · CSPDCL and all state utilities across India.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   APPLIANCE CALCULATOR
═══════════════════════════════════════════════════ */
const ApplianceCalculator: React.FC = () => {
  const { userProfile } = useApp();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'ac-1.5': 2, 'fan-75': 4, 'fridge-150': 1, 'tv-100': 1, 'led-10': 8,
  });
  const [hours, setHours] = useState({ summer: 8, monsoon: 5, winter: 3 });

  const updateQty = (id: string, delta: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const calcKWh = (hrs: number) =>
    APPLIANCES.reduce((t, a) => t + (a.wattage * (quantities[a.id] || 0) * hrs * 30), 0);

  const summerKWh = Math.round(calcKWh(hours.summer));
  const monsoonKWh = Math.round(calcKWh(hours.monsoon));
  const winterKWh = Math.round(calcKWh(hours.winter));

  useEffect(() => {
    const list = APPLIANCES.map(a => ({ ...a, quantity: quantities[a.id] || 0 }));
    recordApplianceCalculatorAction(list, hours, summerKWh, userProfile);
    const activeDevs = list.filter(a => a.quantity > 0);
    const top = activeDevs.sort((a, b) => (b.wattage * b.quantity) - (a.wattage * a.quantity))[0];
    localDB.saveApplianceLoad({
      userId: userProfile.email || 'default_user', totalMonthlyKWh: summerKWh,
      summerHours: hours.summer, monsoonHours: hours.monsoon, winterHours: hours.winter,
      activeAppliancesCount: activeDevs.length, topAppliance: top?.name || 'General',
    }).catch(console.error);
  }, [quantities, hours, summerKWh, userProfile]);

  const role = userProfile.userType || userProfile.userRole || 'Homeowner';

  const barData = {
    labels: ['Summer', 'Monsoon', 'Winter'],
    datasets: [{
      label: 'kWh/month',
      data: [summerKWh, monsoonKWh, winterKWh],
      backgroundColor: ['#ff682c', '#ff8c5a', '#ffb38a'],
      borderRadius: 4,
    }]
  };

  const activeAppliances = APPLIANCES.filter(a => quantities[a.id]);
  const pieData = {
    labels: activeAppliances.map(a => a.name),
    datasets: [{
      data: activeAppliances.map(a => +(a.wattage * hours.summer * 30 * (quantities[a.id] || 0)).toFixed(0)),
      backgroundColor: ['#ff682c', '#816729', '#202020', '#4d4d4d', '#828282', '#ebe6dd', '#efefef', '#e8e8e8'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="vai-grid-2">
      <div className="vai-stack">
        <div className="vai-card">
          <div className="vai-section-label">
            <span className="vai-section-title">Appliance Inventory</span>
            <span className="vai-section-meta">Adjust quantities</span>
          </div>
          <div className="vai-grid-4">
            {APPLIANCES.map(a => (
              <div key={a.id} className="vai-appliance-card">
                <div className="vai-appliance-letter">{a.name.charAt(0)}</div>
                <div className="vai-appliance-name">{a.name}</div>
                <div className="vai-appliance-watts">{(a.wattage * 1000).toFixed(0)}W</div>
                <div className="vai-qty-counter">
                  <button className="vai-qty-btn" onClick={() => updateQty(a.id, -1)}>−</button>
                  <span className="vai-qty-value">{quantities[a.id] || 0}</span>
                  <button className="vai-qty-btn" onClick={() => updateQty(a.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vai-card--white">
          <div className="vai-section-label">
            <span className="vai-section-title">Seasonal Hours</span>
          </div>
          {(['summer', 'monsoon', 'winter'] as const).map(season => (
            <div key={season} className="vai-form-group">
              <div className="vai-range-label">
                <span style={{ textTransform: 'capitalize' }}>{season} usage</span>
                <strong>{hours[season]} hrs/day</strong>
              </div>
              <input
                type="range" min="0" max="24" value={hours[season]}
                onChange={e => setHours({ ...hours, [season]: +e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="vai-stack">
        {/* Stats */}
        <div className="vai-stat-row">
          {[['Summer', summerKWh], ['Monsoon', monsoonKWh], ['Winter', winterKWh]].map(([s, v]) => (
            <div key={s} className="vai-stat">
              <div className="vai-stat-value">{v}</div>
              <div className="vai-stat-label">{s} kWh/mo</div>
            </div>
          ))}
        </div>

        <div className="vai-card--white">
          <div className="vai-section-title" style={{ marginBottom: '16px' }}>Seasonal Consumption</div>
          <div style={{ height: '180px' }}>
            <Bar data={barData} options={{
              responsive: true, maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, grid: { color: '#f5f5f5' }, ticks: { color: '#828282', font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { color: '#828282', font: { size: 11 } } }
              },
              plugins: { legend: { display: false } }
            }} />
          </div>
        </div>

        <div className="vai-card--white">
          <div className="vai-section-title" style={{ marginBottom: '16px' }}>Summer Load Breakdown</div>
          {pieData.labels.length > 0 ? (
            <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
              <PieChart
                labels={pieData.labels}
                data={pieData.datasets[0].data}
                colors={pieData.datasets[0].backgroundColor}
                centerText={`${pieData.labels.length} Devices`}
                centerSubtext="Summer"
              />
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '24px 0', fontSize: '13px', color: 'var(--vai-slate)' }}>
              Add appliances above to see breakdown.
            </p>
          )}
        </div>

        <div className="vai-card--ivory">
          <div className="vai-insight-label">Load AI Insight — {role}</div>
          <p className="vai-insight-text">
            {role === 'Landowner'
              ? `Summer peak demand reaches ${summerKWh} kWh/mo. Solarising agricultural pumps under PM-KUSUM Component B eliminates grid reliance during daytime irrigation.`
              : role === 'Solar Vendor'
              ? `Client summer load model: ${summerKWh} kWh/mo. Recommend proposing a ${((summerKWh) / 120).toFixed(1)} kW system with hybrid battery storage for maximum offset.`
              : `Your modelled summer load of ${summerKWh} kWh/mo vs. bill implies ${Math.abs(summerKWh - Math.round((+(userProfile.billAmount || 3200)) / 9.5))} kWh gap. The AI Advisor will reconcile both signals when sizing your system.`}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   AI ADVISOR — with full Markdown rendering
═══════════════════════════════════════════════════ */
const AIAdvisor: React.FC = () => {
  const { userProfile, language } = useApp();
  const role = userProfile.userType || userProfile.userRole || 'Homeowner';
  const centralCtx = getCentralizedContext(userProfile);

  const initGreeting = language === 'hi'
    ? `नमस्ते ${userProfile.firstName || userProfile.name || 'जी'}! 👋 मैं आपका **सूर्यसेतु AI सोलर सलाहकार** हूँ। आपका **${role}** संदर्भ लोड हो गया है। आज मैं आपकी क्या सहायता कर सकता हूँ?`
    : language === 'mr'
      ? `नमस्कार ${userProfile.firstName || userProfile.name || 'जी'}! 👋 मी तुमचा **सूर्यसेतु AI सोलर सल्लागार** आहे. तुमचे **${role}** प्रोफाइल लोड झाले आहे. मी तुम्हाला कशी मदत करू शकतो?`
      : `Hello ${userProfile.firstName || userProfile.name || 'there'}! 👋 I am your **SuryaSetu Solar AI Advisor**.

I have loaded your **${role}** pathway from the Centralized Context Engine:
- 📍 **Location:** ${centralCtx.onboarding.state} — ${centralCtx.onboarding.discom}
- 🧾 **Bill Signal:** ${centralCtx.billScanner.scannedAt ? `${centralCtx.billScanner.unitsConsumed} kWh / ₹${centralCtx.billScanner.billAmount.toLocaleString('en-IN')}` : `₹${centralCtx.onboarding.billAmount.toLocaleString('en-IN')}/mo`}
- 🏠 **Roof Baseline:** ${centralCtx.onboarding.roofArea} sq ft

Ask me anything about subsidies, sizing, DISCOM net-metering, or your solar transition.`;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeModelLabel, setActiveModelLabel] = useState<string>(MODEL_LABELS.primary);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: 'user', content: text };
    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    const systemPrompt = buildSolarAdvisorPrompt(userProfile, language, text);
    const apiMessages: Message[] = [...messages, userMsg];

    try {
      const stream = chatStream(
        apiMessages, systemPrompt,
        (label) => setActiveModelLabel(label),
        userProfile, language
      );
      let currentText = '';
      for await (const chunk of stream) {
        currentText += chunk;
        setMessages(prev => {
          const msgs = [...prev];
          if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1] = { role: 'assistant', content: currentText };
          }
          return msgs;
        });
      }
    } catch {
      setMessages(prev => {
        const msgs = [...prev];
        if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
          msgs[msgs.length - 1] = { role: 'assistant', content: 'I encountered an issue. Please try again.' };
        }
        return msgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, userProfile, language]);

  const prompts = role === 'Landowner'
    ? ['PM-KUSUM Component A land lease revenue?', 'Substation distance requirement?', 'Component B standalone pumps?', '25-year PPA tariff rates?']
    : role === 'Solar Vendor'
    ? ['PM Surya Ghar empanelment steps?', 'GSTIN & license compliance?', 'ALMM module procurement?', 'Customer ROI pitch generator?']
    : ['PM Surya Ghar subsidy for 3 kW?', 'Roof area for 2 kW solar?', 'DISCOM net-metering procedure?', 'On-grid vs hybrid storage?'];

  const userName = userProfile.firstName || userProfile.name || 'U';

  return (
    <div className="vai-chat-shell">
      {/* Header */}
      <div className="vai-chat-header">
        <div className="vai-chat-model-badge">
          <Cpu size={13} />
          {activeModelLabel}
          <div className="vai-chat-model-dot" />
        </div>
        <div className="vai-chat-context-label">
          <Layers size={13} />
          Context Engine Active · {role}
        </div>
      </div>

      {/* Context Signal Banner */}
      <div className="vai-context-banner">
        {[
          { label: 'Location', value: `${centralCtx.onboarding.state} · ${centralCtx.onboarding.discom}` },
          { label: 'Bill', value: centralCtx.billScanner.scannedAt ? `${centralCtx.billScanner.unitsConsumed} kWh` : `₹${centralCtx.onboarding.billAmount}/mo` },
          { label: 'Load', value: centralCtx.applianceCalculator.calculatedAt ? `${centralCtx.applianceCalculator.totalMonthlyKWh} kWh/mo` : 'Baseline' },
          { label: 'Roof', value: `${centralCtx.onboarding.roofArea} sq ft` },
        ].map(sig => (
          <div key={sig.label} className="vai-context-signal">
            <div className="signal-dot" />
            <strong>{sig.label}:</strong> {sig.value}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="vai-chat-messages">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const streaming = msg.role === 'assistant' && isStreaming && isLast;
          return (
            <div key={i} className={`vai-msg-row ${msg.role === 'user' ? 'vai-msg-row--user' : ''}`}>
              {msg.role === 'assistant' ? (
                <div className="vai-avatar"><Sparkles size={15} /></div>
              ) : (
                <div className="vai-avatar vai-avatar--user">{userName.charAt(0).toUpperCase()}</div>
              )}
              <div className={`vai-bubble vai-bubble--${msg.role === 'user' ? 'user' : 'ai'} ${streaming ? 'vai-bubble--streaming' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="vai-md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Chips */}
      <div className="vai-prompt-chips">
        {prompts.map(p => (
          <button key={p} className="vai-chip" onClick={() => send(p)} disabled={isStreaming}>{p}</button>
        ))}
      </div>

      {/* Input */}
      <div className="vai-chat-input-row">
        <input
          className="vai-chat-input"
          placeholder={
            role === 'Landowner' ? 'Ask about PM-KUSUM, land lease revenue, PPA rates…'
            : role === 'Solar Vendor' ? 'Ask about empanelment, GSTIN compliance, DISCOM rules…'
            : 'Ask about PM Surya Ghar, subsidies, sizing, net-metering…'
          }
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          disabled={isStreaming}
        />
        <button
          className="vai-send-btn"
          onClick={() => send(input)}
          disabled={isStreaming || !input.trim()}
          aria-label="Send"
        >
          {isStreaming ? <span className="vai-spinner" style={{ width: 16, height: 16 }} /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
};

export default SolarAI;
