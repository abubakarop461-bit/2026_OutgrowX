import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, CheckCircle, Info, Sparkles, Send, Cpu } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { chatStream, Message } from '../../services/ai';
import { buildSolarAdvisorPrompt, MODEL_LABELS } from '../../services/prompts';
import { scanBill, BillData } from '../../services/billScanner';
import { APPLIANCES } from '../../data/applianceProfiles';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const SolarAI: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'bill' | 'calculator' | 'advisor'>('bill');

  return (
    <main className="container pb-12">
      <header className="page-header mt-8">
        <h1>{t('solarAI') || 'Solar AI Intelligence'}</h1>
        <p className="text-secondary">Analyze your energy usage and get personalized solar recommendations.</p>
      </header>

      <div className="tabs mb-6">
        <button
          className={`tab-btn ${activeTab === 'bill' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('bill')}
        >
          {t('scanBill') || 'Bill Scanner'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'calculator' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Appliance Calculator
        </button>
        <button
          className={`tab-btn ${activeTab === 'advisor' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('advisor')}
        >
          {t('askAdvisor') || 'AI Advisor'}
        </button>
      </div>

      {activeTab === 'bill' && <BillScanner />}
      {activeTab === 'calculator' && <ApplianceCalculator />}
      {activeTab === 'advisor' && <AIAdvisor />}
    </main>
  );
};

const BillScanner: React.FC = () => {
  const { setProfile } = useApp();
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<BillData | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleUseData = () => {
    if (!result) return;
    setProfile({
      billAmount: result.billAmount,
      avgBill: result.billAmount,
      discom: result.discom,
    });
  };

  return (
    <div className="grid-2">
      <div className="flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload electricity bill"
        />
        <div
          className={`upload-zone ${isDragging ? 'upload-zone--drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          aria-label="Upload electricity bill for scanning"
        >
          <UploadCloud className="upload-zone__icon mx-auto" />
          <h4 className="upload-zone__text">Drag & drop your electricity bill here</h4>
          <p className="upload-zone__subtext">Supports PDF, JPG, PNG (Max 5MB)</p>
        </div>

        {scanning && (
          <div className="glass-card flex-col items-center gap-3 text-center">
            <div className="spinner"></div>
            <p className="text-secondary">Extracting bill data with AI...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="text-red text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="glass-card">
            <h4 className="mb-4">Extracted Bill Data:</h4>
            <div className="flex-col gap-2 mb-6">
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>DISCOM: {result.discom}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>Consumer No: {result.consumerNumber}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>Units Consumed: {result.unitsConsumed} kWh</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>Bill Amount: ₹{result.billAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>Billing Period: {result.billingPeriod}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>Consumer Category: {result.consumerCategory}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green" /> <span>Model: {result.modelUsed}</span></div>
            </div>
            <button className="btn btn-primary w-full justify-center" onClick={handleUseData}>
              Use This Data
            </button>
          </div>
        )}
      </div>
      <div>
        <div className="glass-card glass-card--no-hover">
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} className="text-accent" />
            <h4>How it works</h4>
          </div>
          <p className="mb-4 text-secondary">
            Our advanced AI scans your electricity bill to extract your historical consumption patterns, tariff rates, and sanctioned load. This helps us design a solar system tailored perfectly to your unique needs.
          </p>
          <p className="text-secondary">
            Your data is processed securely and is never shared with third parties without your consent.
          </p>
        </div>
      </div>
    </div>
  );
};

const ApplianceCalculator: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [hours, setHours] = useState<Record<string, number>>({
    summer: 8,
    monsoon: 5,
    winter: 3
  });

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const calcSeasonKWh = (seasonHours: number) => {
    return APPLIANCES.reduce((sum, a) => {
      return sum + (a.wattage * 1000) * seasonHours * 30 * (quantities[a.id] || 0) / 1000;
    }, 0);
  };

  const summerKWh = calcSeasonKWh(hours.summer);
  const monsoonKWh = calcSeasonKWh(hours.monsoon);
  const winterKWh = calcSeasonKWh(hours.winter);

  const barData = {
    labels: ['Summer', 'Monsoon', 'Winter'],
    datasets: [
      {
        label: 'Energy Consumption (kWh)',
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
      data: activeAppliances.map(a => (a.wattage * 1000) * hours.summer * 30 * (quantities[a.id] || 0) / 1000),
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
              <div style={{ fontSize: '1.5rem' }}>{a.name.charAt(0)}</div>
              <div className="text-xs font-semibold text-center">{a.name}</div>
              <div className="text-xs text-muted">{a.wattage * 1000}W</div>
              <div className="qty-counter">
                <button className="qty-btn" onClick={() => updateQty(a.id, -1)} aria-label={`Decrease ${a.name}`}>-</button>
                <span className="qty-value">{quantities[a.id] || 0}</span>
                <button className="qty-btn" onClick={() => updateQty(a.id, 1)} aria-label={`Increase ${a.name}`}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <h4 className="mb-4">Seasonal Usage Adjuster</h4>

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
              <Pie data={pieData} options={{ plugins: { legend: { position: 'right', labels: { color: '#8BAF95' } } }, maintainAspectRatio: false }} />
            </div>
) : (
            <p className="text-muted text-center py-4">Add appliances to see breakdown.</p>
          )}
        </div>

        <div className="glass-card glass-card--no-hover flex gap-3 items-start">
          <Sparkles className="text-accent shrink-0" />
          <div>
            <h5 className="mb-1">AI Insight</h5>
            <p className="text-sm text-secondary">Your cooling appliances contribute significantly to your summer usage. Consider sizing your solar system to cover the summer peak, ensuring 100% bill offset during the hottest months.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAdvisor: React.FC = () => {
  const { userProfile, language } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your SuryX Solar Pro Advisor backed by our Single Source of Truth Knowledge Base. How can I help you regarding PM Surya Ghar, subsidies, payback, or DISCOM policies today?' }
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
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const aiMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, aiMsg]);

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
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: currentText };
          return newMsgs;
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, userProfile, language]);

  const prompts = [
    "PM Surya Ghar subsidy for 3 kW?",
    "Roof area needed for 2 kW?",
    "PM-KUSUM scheme details?",
    "Documents required to apply?",
    "What is the capital of France?"
  ];

  return (
    <div className="glass-card p-0 flex-col" style={{ height: '600px', overflow: 'hidden' }}>
      <div className="flex items-center justify-between p-3 px-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="model-badge">
          <Cpu size={14} />
          <span>{activeModelLabel}</span>
          <div className="model-badge__dot"></div>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          SuryX Single Source of Truth Knowledge Engine
        </span>
      </div>

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

      <div className="prompt-chips" style={{ padding: 'var(--space-2) var(--space-4)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {prompts.map(p => (
          <button key={p} className="prompt-chip" onClick={() => send(p)} disabled={isStreaming}>{p}</button>
        ))}
      </div>

      <div className="chat-input-row" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <input 
          className="chat-input"
          placeholder="Ask anything about PM Surya Ghar, subsidies, DISCOM, solar pump rules..."
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

