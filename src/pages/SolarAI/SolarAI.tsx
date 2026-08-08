import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, Info, Sparkles, Send, Cpu } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const APPLIANCES = [
  { id: 'ac', name: 'AC', emoji: '🌀', wattage: 1500 },
  { id: 'cooler', name: 'Cooler', emoji: '💨', wattage: 200 },
  { id: 'fan', name: 'Fan', emoji: '🪭', wattage: 75 },
  { id: 'fridge', name: 'Refrigerator', emoji: '🧊', wattage: 150 },
  { id: 'tv', name: 'TV', emoji: '📺', wattage: 100 },
  { id: 'computer', name: 'Computer', emoji: '💻', wattage: 300 },
  { id: 'lights', name: 'Lights', emoji: '💡', wattage: 10 },
  { id: 'geyser', name: 'Geyser', emoji: '🫙', wattage: 2000 },
  { id: 'ev', name: 'EV Charger', emoji: '🔌', wattage: 3300 },
  { id: 'washing', name: 'Washing Machine', emoji: '🧺', wattage: 500 },
  { id: 'induction', name: 'Induction', emoji: '🍳', wattage: 2000 },
  { id: 'pump', name: 'Water Pump', emoji: '💧', wattage: 750 },
];

export const SolarAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bill' | 'calculator' | 'advisor'>('bill');

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
        <h1>Solar AI Intelligence</h1>
        <p>Analyze your energy usage and get personalized solar recommendations.</p>
      </header>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        <button 
          className={`tab-btn ${activeTab === 'bill' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('bill')}
        >
          Bill Scanner
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
          AI Advisor
        </button>
      </div>

      {activeTab === 'bill' && <BillScanner />}
      {activeTab === 'calculator' && <ApplianceCalculator />}
      {activeTab === 'advisor' && <AIAdvisor />}
    </div>
  );
};

const BillScanner: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<boolean>(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    startScan();
  };

  const startScan = () => {
    setScanning(true);
    setResult(false);
    setTimeout(() => {
      setScanning(false);
      setResult(true);
    }, 2000);
  };

  return (
    <div className="grid-2">
      <div className="flex-col gap-4">
        <div 
          className={`upload-zone ${isDragging ? 'upload-zone--drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={startScan}
        >
          <UploadCloud className="upload-zone__icon" style={{ margin: '0 auto' }} />
          <h4 className="upload-zone__text">Drag & drop your electricity bill here</h4>
          <p className="upload-zone__subtext">Supports PDF, JPG, PNG (Max 5MB)</p>
        </div>

        {scanning && (
          <div className="glass-card flex-col items-center gap-3">
            <div className="model-badge__dot"></div>
            <p>Extracting bill data with AI...</p>
          </div>
        )}

        {result && (
          <div className="glass-card">
            <h4 style={{ marginBottom: 'var(--space-4)' }}>Extracted Bill Data:</h4>
            <div className="flex-col gap-2" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--accent-green)" /> <span>DISCOM: MSEDCL</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--accent-green)" /> <span>Consumer No: 123456789</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--accent-green)" /> <span>Units Consumed: 342 kWh</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--accent-green)" /> <span>Bill Amount: ₹3,240</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--accent-green)" /> <span>Billing Period: May-Jun 2026</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--accent-green)" /> <span>Consumer Category: Residential</span></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Use This Data
            </button>
          </div>
        )}
      </div>
      <div>
        <div className="glass-card glass-card--no-hover">
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-4)' }}>
            <Info size={20} color="var(--accent-primary)" />
            <h4>How it works</h4>
          </div>
          <p style={{ marginBottom: 'var(--space-4)' }}>
            Our advanced AI scans your electricity bill to extract your historical consumption patterns, tariff rates, and sanctioned load. This helps us design a solar system tailored perfectly to your unique needs.
          </p>
          <p>
            Your data is processed securely and is never shared with third parties without your consent.
          </p>
        </div>
      </div>
    </div>
  );
};

const ApplianceCalculator: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [hours, setHours] = useState({ summer: 8, monsoon: 5, winter: 3 });

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const calcSeasonKWh = (seasonHours: number) => {
    return APPLIANCES.reduce((sum, a) => {
      return sum + (a.wattage / 1000) * seasonHours * 30 * (quantities[a.id] || 0);
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

  const pieData = {
    labels: APPLIANCES.filter(a => quantities[a.id]).map(a => a.name),
    datasets: [{
      data: APPLIANCES.filter(a => quantities[a.id]).map(a => (a.wattage / 1000) * hours.summer * 30 * (quantities[a.id] || 0)),
      backgroundColor: [
        '#A8FF3E', '#22C55E', '#F59E0B', '#F97316', '#3B82F6', '#8B5CF6'
      ],
      borderWidth: 0,
    }]
  };

  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div className="grid-4" style={{ gap: 'var(--space-3)' }}>
          {APPLIANCES.map(a => (
            <div key={a.id} className="glass-card glass-card--sm flex-col items-center justify-center gap-2">
              <div style={{ fontSize: '1.5rem' }}>{a.emoji}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, textAlign: 'center' }}>{a.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.wattage}W</div>
              <div className="qty-counter">
                <button className="qty-btn" onClick={() => updateQty(a.id, -1)}>-</button>
                <span className="qty-value">{quantities[a.id] || 0}</span>
                <button className="qty-btn" onClick={() => updateQty(a.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <h4 style={{ marginBottom: 'var(--space-4)' }}>Seasonal Usage Adjuster</h4>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
            <div className="flex justify-between"><label>Summer (hrs/day)</label><span>{hours.summer} hrs</span></div>
            <input type="range" min="0" max="24" value={hours.summer} onChange={e => setHours({...hours, summer: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--accent-primary)' }}/>
          </div>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
            <div className="flex justify-between"><label>Monsoon (hrs/day)</label><span>{hours.monsoon} hrs</span></div>
            <input type="range" min="0" max="24" value={hours.monsoon} onChange={e => setHours({...hours, monsoon: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--accent-primary)' }}/>
          </div>

          <div className="form-group">
            <div className="flex justify-between"><label>Winter (hrs/day)</label><span>{hours.winter} hrs</span></div>
            <input type="range" min="0" max="24" value={hours.winter} onChange={e => setHours({...hours, winter: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--accent-primary)' }}/>
          </div>
        </div>
      </div>

      <div className="flex-col gap-6">
        <div className="glass-card">
          <h4 style={{ marginBottom: 'var(--space-4)' }}>Seasonal Consumption</h4>
          <Bar 
            data={barData} 
            options={{ 
              scales: { 
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
              },
              plugins: { legend: { display: false } }
            }} 
          />
        </div>
        
        <div className="glass-card">
          <h4 style={{ marginBottom: 'var(--space-4)' }}>Appliance Breakdown (Summer)</h4>
          {pieData.labels.length > 0 ? (
            <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={pieData} options={{ plugins: { legend: { position: 'right' } }, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-muted text-center py-4">Add appliances to see breakdown.</p>
          )}
        </div>

        <div className="glass-card glass-card--no-hover" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
          <Sparkles color="var(--accent-primary)" />
          <div>
            <h5 style={{ marginBottom: 'var(--space-1)' }}>AI Insight</h5>
            <p style={{ fontSize: '0.875rem' }}>Your cooling appliances contribute significantly to your summer usage. Consider sizing your solar system to cover the summer peak, ensuring 100% bill offset during the hottest months.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

type Message = { role: 'user' | 'ai'; content: string };

const AIAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your Solar Pro Advisor. I have analyzed your context. How can I help you regarding your solar journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const send = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const aiMsg: Message = { role: 'ai', content: '' };
    setMessages(prev => [...prev, aiMsg]);

    const response = "Based on your monthly bill of ₹3,240 and 342 kWh consumption, I recommend a 3 kW solar system. With PM Surya Ghar subsidy, your payback period could be as low as 3.5 years. Would you like to see a detailed financial breakdown?";
    
    let currentText = '';
    for (const char of response) {
      currentText += char;
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = currentText;
        return newMsgs;
      });
      await new Promise(r => setTimeout(r, 15));
    }
    
    setIsStreaming(false);
  };

  const prompts = [
    "How many panels do I need?",
    "What's my payback period?",
    "PM Surya Ghar subsidy for me?",
    "On-grid vs off-grid?",
    "Best time to install in my state?"
  ];

  return (
    <div className="glass-card p-0 flex-col" style={{ height: '600px', overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
        <div className="model-badge">
          <Cpu size={14} />
          <span>Solar Pro Advisor</span>
          <div className="model-badge__dot"></div>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role === 'user' ? 'chat-message--user' : ''}`}>
            {msg.role === 'ai' && (
              <div className="chat-avatar"><Sparkles size={16} color="var(--accent-primary)" /></div>
            )}
            <div className={`chat-bubble chat-bubble--${msg.role} ${(msg.role === 'ai' && isStreaming && i === messages.length - 1) ? 'streaming-cursor' : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="prompt-chips">
        {prompts.map(p => (
          <button key={p} className="prompt-chip" onClick={() => send(p)}>{p}</button>
        ))}
      </div>

      <div className="chat-input-row">
        <input 
          className="chat-input"
          placeholder="Ask anything about solar..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button className="btn btn-primary btn-sm" style={{ padding: '0 16px', borderRadius: 'var(--radius-full)' }} onClick={() => send(input)} disabled={isStreaming || !input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default SolarAI;
