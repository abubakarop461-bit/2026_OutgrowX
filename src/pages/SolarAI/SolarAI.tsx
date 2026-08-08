import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, CheckCircle, Info, Sparkles, Send, Cpu, Layers } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const SolarAI: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'bill' | 'calculator' | 'advisor'>('bill');

  return (
    <main className="container pb-12">
      <header className="page-header mt-8">
        <h1>{t('solarAI') || 'Solar AI Intelligence'}</h1>
        <p className="text-secondary">
          Centralized AI Context Engine parsing your bill scans, load calculations, and role pathways for hyper-personalized solar insights.
        </p>
      </header>

      <div className="tabs mb-6">
        <button
          className={`tab-btn ${activeTab === 'bill' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('bill')}
        >
          {t('scanBill') || 'Bill Scanner AI'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'calculator' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Appliance Load AI
        </button>
        <button
          className={`tab-btn ${activeTab === 'advisor' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('advisor')}
        >
          {t('askAdvisor') || 'AI Advisor Chat'}
        </button>
      </div>

      {activeTab === 'bill' && <BillScanner onNavigateToAdvisor={() => setActiveTab('advisor')} />}
      {activeTab === 'calculator' && <ApplianceCalculator />}
      {activeTab === 'advisor' && <AIAdvisor />}
    </main>
  );
};

const BillScanner: React.FC<{ onNavigateToAdvisor?: () => void }> = ({ onNavigateToAdvisor }) => {
  const { userProfile, setProfile } = useApp();
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<BillData | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = userProfile.userType || userProfile.userRole || 'Homeowner';

  const processFile = async (file: File) => {
    setScanning(true);
    setError('');
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const mimeType = file.type || 'image/jpeg';
        try {
          const data = await scanBill(base64, mimeType);
          setResult(data);
          // Record scan action directly into the Centralized Context Engine
          recordBillScanAction(data, userProfile);
        } catch (err) {
          setError('Failed to scan bill. Please try again.');
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to read file.');
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleApplyData = () => {
    if (!result) return;
    setProfile({
      billAmount: result.billAmount,
      avgBill: result.billAmount,
      discom: result.discom,
    });
    recordBillScanAction(result, userProfile);
    setAppliedSuccess(true);
  };

  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div
          className={`upload-zone ${isDragging ? 'upload-zone--drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
          />
          <UploadCloud size={48} className="text-accent mb-4" />
          <h3 className="mb-2" style={{ fontSize: '1.125rem' }}>Upload Electricity Bill</h3>
          <p className="text-secondary text-sm mb-4">
            Drag &amp; drop your bill image or PDF here, or click to browse.
          </p>
          <span className="badge badge--green">AI OCR Vision Model Powered</span>
        </div>

        {scanning && (
          <div className="glass-card flex items-center justify-center gap-3 py-8">
            <div className="spinner" />
            <span>Scanning bill with AI OCR Vision Model...</span>
          </div>
        )}

        {error && (
          <div className="glass-card bg-red-900/20 border-red-500/30 text-red-400 p-4">
            {error}
          </div>
        )}

        {result && (
          <div className="glass-card" style={{ border: appliedSuccess ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-2 text-accent" style={{ fontSize: '1rem', margin: 0 }}>
                <CheckCircle size={18} /> Extracted Bill Data
              </h4>
              <span className="badge badge--accent" style={{ fontSize: '0.6875rem' }}>
                Recorded in Centralized AI Context Engine
              </span>
            </div>

            <div className="grid-2 gap-4 mb-6 text-sm">
              <div><span className="text-muted">DISCOM:</span> <strong>{result.discom}</strong></div>
              <div><span className="text-muted">Consumer No:</span> <strong>{result.consumerNumber}</strong></div>
              <div><span className="text-muted">Units Consumed:</span> <strong>{result.unitsConsumed} kWh</strong></div>
              <div><span className="text-muted">Bill Amount:</span> <strong className="text-accent">₹{result.billAmount.toLocaleString('en-IN')}</strong></div>
              <div><span className="text-muted">Category:</span> <strong>{result.consumerCategory}</strong></div>
              <div><span className="text-muted">Billing Period:</span> <strong>{result.billingPeriod}</strong></div>
            </div>

            <button
              className={`btn ${appliedSuccess ? 'btn-secondary' : 'btn-primary'} w-full justify-center gap-2 mb-3`}
              onClick={handleApplyData}
              style={{
                fontSize: '0.9375rem',
                background: appliedSuccess ? 'rgba(34,197,94,0.18)' : undefined,
                borderColor: appliedSuccess ? 'rgba(34,197,94,0.35)' : undefined,
                color: appliedSuccess ? '#22C55E' : undefined
              }}
            >
              <CheckCircle size={18} />
              {appliedSuccess ? 'Applied to Centralized AI Context Engine ✓' : 'Apply Data to Centralized AI Context'}
            </button>

            {appliedSuccess && (
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8125rem', color: '#ECF2EE' }}>
                <div style={{ fontWeight: 700, color: '#22C55E', marginBottom: '2px' }}>✓ Context Engine Updated!</div>
                <div>DISCOM ({result.discom}) &amp; Monthly Bill (₹{result.billAmount.toLocaleString('en-IN')}) are now synced across all 3 AI tools, ROI models, and AI Advisor prompts.</div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-2 text-accent p-0"
                  onClick={onNavigateToAdvisor}
                  style={{ textDecoration: 'underline', fontSize: '0.8125rem' }}
                >
                  Open AI Advisor Chat →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-col gap-6">
        <div className="glass-card">
          <h4 className="mb-3" style={{ fontSize: '1rem' }}>Personalized Role AI Insight</h4>
          <p className="text-secondary text-sm leading-relaxed mb-4">
            {role === 'Landowner'
              ? 'As a Landowner, electricity bill scans help establish baseline power tariffs for agricultural solar feeder projects under PM-KUSUM Component A/C.'
              : role === 'Solar Vendor'
              ? 'As a Solar Vendor, client bill OCR scans automatically structure customer quotes, tariff slab offsets, and DISCOM net-metering application forms.'
              : 'As a Homeowner, your monthly bill is parsed to determine exact kW solar PV sizing, PM Surya Ghar subsidy tiers, and 25-year cumulative savings.'}
          </p>

          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-secondary flex items-start gap-2">
            <Info size={16} className="text-accent shrink-0 mt-0.5" />
            <span>Supported DISCOMs: MSEDCL, TANGEDCO, BESCOM, UGVCL, JVVNL, BSES, PSPCL, KSEB, WBSEDCL &amp; all state utilities across India.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplianceCalculator: React.FC = () => {
  const { userProfile } = useApp();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'ac-1.5': 2,
    'fan-75': 4,
    'fridge-150': 1,
    'tv-100': 1,
    'led-10': 8,
  });

  const [hours, setHours] = useState({
    summer: 8,
    monsoon: 5,
    winter: 3,
  });

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const calculateKWh = (hrs: number) => {
    return APPLIANCES.reduce((total, app) => {
      const qty = quantities[app.id] || 0;
      return total + (app.wattage * qty * hrs * 30);
    }, 0);
  };

  const summerKWh = Math.round(calculateKWh(hours.summer));
  const monsoonKWh = Math.round(calculateKWh(hours.monsoon));
  const winterKWh = Math.round(calculateKWh(hours.winter));

  // Sync with Centralized Context Engine on load changes
  useEffect(() => {
    const activeList = APPLIANCES.map(a => ({ ...a, quantity: quantities[a.id] || 0 }));
    recordApplianceCalculatorAction(activeList, hours, summerKWh, userProfile);
  }, [quantities, hours, summerKWh, userProfile]);

  const role = userProfile.userType || userProfile.userRole || 'Homeowner';

  const barData = {
    labels: ['Summer', 'Monsoon', 'Winter'],
    datasets: [
      {
        label: 'Energy Consumption (kWh/mo)',
        data: [summerKWh, monsoonKWh, winterKWh],
        backgroundColor: 'rgba(168, 255, 62, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const activeAppliances = APPLIANCES.filter(a => quantities[a.id]);
  const pieData = {
    labels: activeAppliances.map(a => a.name),
    datasets: [{
      data: activeAppliances.map(a => (a.wattage * hours.summer * 30 * (quantities[a.id] || 0))),
      backgroundColor: ['#A8FF3E', '#22C55E', '#F59E0B', '#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div className="grid-4 gap-3">
          {APPLIANCES.map(a => (
            <div key={a.id} className="glass-card glass-card--sm flex-col items-center justify-center gap-2">
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#A8FF3E' }}>{a.name.charAt(0)}</div>
              <div className="text-xs font-semibold text-center">{a.name}</div>
              <div className="text-xs text-muted">{(a.wattage * 1000).toFixed(0)}W</div>
              <div className="qty-counter">
                <button className="qty-btn" onClick={() => updateQty(a.id, -1)} aria-label={`Decrease ${a.name}`}>-</button>
                <span className="qty-value">{quantities[a.id] || 0}</span>
                <button className="qty-btn" onClick={() => updateQty(a.id, 1)} aria-label={`Increase ${a.name}`}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <h4 className="mb-4">Seasonal Hours Adjuster</h4>

          <div className="form-group mb-3">
            <div className="flex justify-between"><label>Summer (hrs/day)</label><span>{hours.summer} hrs</span></div>
            <input type="range" min="0" max="24" value={hours.summer} onChange={e => setHours({ ...hours, summer: parseInt(e.target.value) })} className="w-full" style={{ accentColor: 'var(--accent-primary)' }} />
          </div>

          <div className="form-group mb-3">
            <div className="flex justify-between"><label>Monsoon (hrs/day)</label><span>{hours.monsoon} hrs</span></div>
            <input type="range" min="0" max="24" value={hours.monsoon} onChange={e => setHours({ ...hours, monsoon: parseInt(e.target.value) })} className="w-full" style={{ accentColor: 'var(--accent-primary)' }} />
          </div>

          <div className="form-group">
            <div className="flex justify-between"><label>Winter (hrs/day)</label><span>{hours.winter} hrs</span></div>
            <input type="range" min="0" max="24" value={hours.winter} onChange={e => setHours({ ...hours, winter: parseInt(e.target.value) })} className="w-full" style={{ accentColor: 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      <div className="flex-col gap-6">
        <div className="glass-card">
          <h4 className="mb-4">Seasonal Consumption</h4>
          <div className="chart-container chart-container--sm">
            <Bar
              data={barData}
              options={{
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8BAF95' } },
                  x: { grid: { display: false }, ticks: { color: '#8BAF95' } }
                },
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="glass-card">
          <h4 className="mb-4">Appliance Breakdown (Summer)</h4>
          {pieData.labels.length > 0 ? (
            <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
              <PieChart
                labels={pieData.labels}
                data={pieData.datasets[0].data}
                colors={pieData.datasets[0].backgroundColor}
                centerText={`${pieData.labels.length} Devices`}
                centerSubtext="Summer"
              />
            </div>
          ) : (
            <p className="text-muted text-center py-4">Add appliances to see breakdown.</p>
          )}
        </div>

        <div className="glass-card glass-card--no-hover flex gap-3 items-start">
          <Sparkles className="text-accent shrink-0" />
          <div>
            <h5 className="mb-1" style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Personalized Load AI Insight ({role})</h5>
            <p className="text-sm text-secondary leading-relaxed">
              {role === 'Landowner'
                ? `Summer peak demand reaches ${summerKWh} kWh/mo. Solarizing agricultural pumps under PM-KUSUM Component B eliminates grid reliance during daytime irrigation.`
                : role === 'Solar Vendor'
                ? `Client summer load model indicates ${summerKWh} kWh/mo peak demand. Recommend proposing a ${((summerKWh) / 120).toFixed(1)} kW system with hybrid battery storage.`
                : `Your cooling appliances contribute significantly to your ${summerKWh} kWh summer usage. Consider sizing your solar system to cover the summer peak for 100% bill offset.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAdvisor: React.FC = () => {
  const { userProfile, language } = useApp();
  const role = userProfile.userType || userProfile.userRole || 'Homeowner';
  const centralCtx = getCentralizedContext(userProfile);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userProfile.firstName || userProfile.name || 'there'}! I am your SuryaSetu Solar AI Advisor. I am powered by our Centralized Context Engine aligned with your active role pathway (${role}). How can I assist you today regarding subsidies, policy rules, payback, or DISCOM net-metering?`
    }
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
      const stream = chatStream(apiMessages, systemPrompt, (modelLabel) => {
        setActiveModelLabel(modelLabel);
      });

      let currentText = '';
      for await (const chunk of stream) {
        currentText += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
            newMsgs[newMsgs.length - 1] = { role: 'assistant', content: currentText };
          }
          return newMsgs;
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
          newMsgs[newMsgs.length - 1] = {
            role: 'assistant',
            content: 'I apologize, but I encountered an issue. Please try again.'
          };
        }
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, userProfile, language]);

  const prompts = role === 'Landowner'
    ? [
        "PM-KUSUM Component A 0.5MW land lease revenue?",
        "Substation distance requirements for solar plant?",
        "PM-KUSUM Component B standalone solar pumps?",
        "DISCOM 25-year Power Purchase Agreement (PPA) rates?"
      ]
    : role === 'Solar Vendor'
    ? [
        "PM Surya Ghar installer portal empanelment steps?",
        "GSTIN & DISCOM license compliance checklist?",
        "ALMM certified solar module procurement?",
        "Customer ROI closing pitch generator?"
      ]
    : [
        "PM Surya Ghar subsidy for 3 kW system?",
        "Roof area required for 2 kW solar?",
        "DISCOM net-metering application procedure?",
        "On-grid vs hybrid battery solar storage?"
      ];

  return (
    <div className="glass-card p-0 flex-col" style={{ height: '640px', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3 px-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="model-badge">
          <Cpu size={14} />
          <span>{activeModelLabel}</span>
          <div className="model-badge__dot"></div>
        </div>
        <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: '#A8FF3E', fontWeight: 600 }}>
          <Layers size={14} />
          Centralized AI Context Engine Active ({role})
        </div>
      </div>

      {/* Centralized Context Signal Banner */}
      <div style={{ background: 'rgba(168,255,62,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '6px 16px', display: 'flex', gap: '12px', overflowX: 'auto', fontSize: '0.6875rem', color: '#7A9484' }}>
        <span>📍 <strong>Location:</strong> {centralCtx.onboarding.state} ({centralCtx.onboarding.discom})</span>
        <span>🧾 <strong>Bill Signal:</strong> {centralCtx.billScanner.scannedAt ? `${centralCtx.billScanner.unitsConsumed} kWh` : `₹${centralCtx.onboarding.billAmount}/mo`}</span>
        <span>⚡ <strong>Load Model:</strong> {centralCtx.applianceCalculator.calculatedAt ? `${centralCtx.applianceCalculator.totalMonthlyKWh} kWh` : 'Baseline'}</span>
        <span>🏠 <strong>Property:</strong> {centralCtx.onboarding.roofArea} sq ft</span>
      </div>

      {/* Chat Messages Container */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role === 'user' ? 'chat-message--user' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="chat-avatar"><Sparkles size={16} color="var(--accent-primary)" /></div>
            )}
            <div className={`chat-bubble chat-bubble--${msg.role === 'user' ? 'user' : 'ai'} ${(msg.role === 'assistant' && isStreaming && i === messages.length - 1) ? 'streaming-cursor' : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="prompt-chips" style={{ padding: 'var(--space-2) var(--space-4)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {prompts.map(p => (
          <button key={p} className="prompt-chip" onClick={() => send(p)} disabled={isStreaming}>{p}</button>
        ))}
      </div>

      {/* Input Row */}
      <div className="chat-input-row" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <input 
          className="chat-input"
          placeholder={role === 'Landowner' ? "Ask about PM-KUSUM, land lease revenue, PPA rates..." : role === 'Solar Vendor' ? "Ask about installer empanelment, GSTIN compliance, DISCOM rules..." : "Ask anything about PM Surya Ghar, subsidies, DISCOM net-metering..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          disabled={isStreaming}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary btn-sm"
          style={{ padding: '0 16px', borderRadius: 'var(--radius-full)' }}
          onClick={() => send(input)}
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default SolarAI;
