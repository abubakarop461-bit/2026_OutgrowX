import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Zap, Sun, DollarSign, CheckCircle2, Calendar, Sparkles, Layers, ShieldCheck, Flame, Cpu, ArrowUpRight, ChevronRight, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { calculateROI, getStateGridHistory } from '../../services/roiCalculator';
import { calculateSolarScore } from '../../services/solarScorer';
import { checkSubsidyEligibility } from '../../data/govtSchemes';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

// Count-up Animated Component
const CountUp: React.FC<{ end: number; prefix?: string; suffix?: string; decimals?: number }> = ({ end, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let rafId: number;
    const duration = 1400;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };
    rafId = window.requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [end]);

  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

// Animated Horizontal Score Bar
const AnimatedBar: React.FC<{ value: number; label: string; color?: string; delay?: number }> = ({ value, label, color = 'var(--accent-primary)', delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100 + delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="score-bar-item mb-3">
      <div className="flex justify-between mb-1" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}/100</span>
      </div>
      <div style={{ height: '8px', borderRadius: '9999px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '9999px',
            width: `${width}%`,
            background: color,
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { userProfile } = useApp();
  const { t } = useTranslation();

  // Selected Dashboard Theme/Layout Option (1: Glass Emerald, 2: Solar Flare Bento, 3: Cyber Dark Command)
  const [dashboardOption, setDashboardOption] = useState<'1' | '2' | '3'>(() => {
    return (localStorage.getItem('suryasetu_dash_option') as any) || '1';
  });

  const [yearSpan, setYearSpan] = useState<10 | 20 | 25>(20);
  const [insightText, setInsightText] = useState('');
  const [activeTabOption3, setActiveTabOption3] = useState<'roi' | 'bills' | 'score'>('roi');

  // Handle option change
  const selectOption = (opt: '1' | '2' | '3') => {
    setDashboardOption(opt);
    localStorage.setItem('suryasetu_dash_option', opt);
  };

  // User details
  const userName = userProfile.firstName || userProfile.name || 'Friend';
  const userState = userProfile.state || 'Maharashtra';
  const userDiscom = userProfile.discom || 'MSEDCL';
  const avgBill = Number(userProfile.avgBill || userProfile.billAmount || 3200);

  // Dynamic calculations
  const roiData = calculateROI(userProfile as any);
  const solarScore = calculateSolarScore(userProfile as any);
  const gridHistory = getStateGridHistory(userState, userDiscom);
  const eligibleSchemes = checkSubsidyEligibility(userProfile as any);

  const monthlySavings = Math.round(roiData.annualSavings / 12);
  const paybackYears = roiData.paybackYears;
  const recommendedKW = roiData.systemSizeKW;
  const subsidyAmount = roiData.subsidy;

  // Streaming AI insight text
  const fullInsight = `Based on ${userDiscom}'s 7.8% annual rate escalation in ${userState}, going solar today saves an estimated ₹${monthlySavings.toLocaleString('en-IN')}/month and ₹${(roiData.roi25Year / 100000).toFixed(1)} Lakh over 25 years.`;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setInsightText(fullInsight.slice(0, i));
      i++;
      if (i > fullInsight.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [fullInsight]);

  // --- Chart Datasets ---

  // 20-Year ROI Line Chart
  const roiLabels = Array.from({ length: yearSpan + 1 }, (_, i) => (2005 + i).toString());
  const gridCumulativeCost = Array.from({ length: yearSpan + 1 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12));
  const solarCumulativeSavings = roiData.yearlyData.slice(0, yearSpan + 1).map(y => Math.max(0, y.cumulative));

  const roiChartData = {
    labels: roiLabels,
    datasets: [
      {
        label: 'Grid Cost (Stayed on Grid)',
        data: gridCumulativeCost,
        borderColor: dashboardOption === '2' ? '#F59E0B' : dashboardOption === '3' ? '#FF007A' : '#F97316',
        backgroundColor: dashboardOption === '2' ? 'rgba(245, 158, 11, 0.12)' : dashboardOption === '3' ? 'rgba(255, 0, 122, 0.12)' : 'rgba(249, 115, 22, 0.12)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Solar Cumulative Savings',
        data: solarCumulativeSavings,
        borderColor: dashboardOption === '2' ? '#FF7A00' : dashboardOption === '3' ? '#00F2FE' : '#A8FF3E',
        backgroundColor: dashboardOption === '2' ? 'rgba(255, 122, 0, 0.15)' : dashboardOption === '3' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(168, 255, 62, 0.15)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const roiChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => context.parsed.y != null ? `₹ ${(context.parsed.y / 100000).toFixed(1)}L` : ''
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8BAF95' } },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8BAF95', callback: (v) => '₹' + (Number(v) / 100000).toFixed(1) + 'L' }
      }
    }
  };

  // Grouped Monthly Bill Comparison Chart
  const billMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const billChartData = {
    labels: billMonths,
    datasets: [
      {
        label: 'Before Solar (Grid)',
        data: [avgBill * 0.9, avgBill * 0.95, avgBill * 1.1, avgBill * 1.25, avgBill * 1.3, avgBill * 1.05],
        backgroundColor: dashboardOption === '2' ? 'rgba(245, 158, 11, 0.6)' : dashboardOption === '3' ? 'rgba(255, 0, 122, 0.6)' : 'rgba(249, 115, 22, 0.6)',
        borderRadius: 4,
      },
      {
        label: 'After Solar',
        data: [avgBill * 0.15, avgBill * 0.15, avgBill * 0.2, avgBill * 0.25, avgBill * 0.25, avgBill * 0.18],
        backgroundColor: dashboardOption === '2' ? '#F59E0B' : dashboardOption === '3' ? '#00F2FE' : '#A8FF3E',
        borderRadius: 4,
      }
    ]
  };

  // Energy Source Pie Chart
  const pieData = {
    labels: ['Solar Energy', 'Grid Energy'],
    datasets: [
      {
        data: [82, 18],
        backgroundColor: [
          dashboardOption === '2' ? '#F59E0B' : dashboardOption === '3' ? '#00F2FE' : '#A8FF3E',
          'rgba(255, 255, 255, 0.1)'
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2rem 1.5rem', color: 'var(--text-primary)', position: 'relative' }}>
      
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute', top: '5%', right: '10%', width: '500px', height: '500px',
        background: dashboardOption === '2' 
          ? 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)' 
          : dashboardOption === '3' 
            ? 'radial-gradient(circle, rgba(0,242,254,0.07) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* ══════════════════════════════════════════════════════════════════════════
            TOP BAR: DASHBOARD DESIGN SELECTOR (3 Huashu-Design & Impeccable Options)
            ══════════════════════════════════════════════════════════════════════════ */}
        <div className="glass-card" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
          border: '1px solid rgba(168,255,62,0.18)', background: 'rgba(13,26,16,0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(168,255,62,0.12)', border: '1px solid rgba(168,255,62,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Layers size={20} color="#A8FF3E" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#F0FFF4', fontFamily: 'Outfit, sans-serif' }}>
                Dashboard UI Style Selector
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Crafted using <span style={{ color: '#A8FF3E' }}>huashu-design</span> & <span style={{ color: '#A8FF3E' }}>impeccable</span> design rules
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: '1', label: '💎 Option 1: Glass Emerald', badge: 'Default' },
              { id: '2', label: '☀️ Option 2: Solar Flare Bento', badge: 'Vibrant' },
              { id: '3', label: '⚡ Option 3: Cyber Command', badge: 'Enterprise' }
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectOption(opt.id as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: dashboardOption === opt.id ? '1px solid #A8FF3E' : '1px solid rgba(255,255,255,0.08)',
                  background: dashboardOption === opt.id ? 'rgba(168,255,62,0.15)' : 'rgba(255,255,255,0.03)',
                  color: dashboardOption === opt.id ? '#A8FF3E' : 'var(--text-secondary)',
                  transition: 'all 200ms ease-out',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <span>{opt.label}</span>
                {dashboardOption === opt.id && (
                  <span style={{ fontSize: '0.75rem', background: '#A8FF3E', color: '#070D09', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                    ACTIVE
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════════════════════════
            OPTION 1: GLASSMORPHIC EMERALD (DEFAULT / CYBER GRID)
            ══════════════════════════════════════════════════════════════════════════ */}
        {dashboardOption === '1' && (
          <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. Welcome Hero */}
            <header className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#F0FFF4' }}>
                  Good morning, {userName} ☀️
                </h1>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Solar Intelligence for <strong style={{ color: '#F0FFF4' }}>{userState}</strong> · DISCOM: <strong style={{ color: '#A8FF3E' }}>{userDiscom}</strong>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', justifyContent: 'flex-end' }}>
                  <Calendar size={16} color="#A8FF3E" />
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="badge badge--accent">✦ Model Insights Live</div>
              </div>
            </header>

            {/* 2. KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="glass-card p-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="stat-label">Monthly Savings</span>
                  <div className="badge badge--green" style={{ fontSize: '0.75rem' }}><TrendingUp size={12} /> +85%</div>
                </div>
                <div className="stat-value stat-value--accent" style={{ fontSize: '2.25rem' }}>
                  <CountUp end={monthlySavings} prefix="₹" />
                </div>
              </div>

              <div className="glass-card p-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="stat-label">Payback Period</span>
                  <DollarSign size={16} color="var(--text-secondary)" />
                </div>
                <div className="stat-value" style={{ fontSize: '2.25rem' }}>
                  <CountUp end={paybackYears} decimals={1} suffix=" yrs" />
                </div>
              </div>

              <div className="glass-card p-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="stat-label">Recommended System</span>
                  <div className="badge badge--accent" style={{ fontSize: '0.75rem' }}>Optimal</div>
                </div>
                <div className="stat-value" style={{ fontSize: '2.25rem' }}>
                  {recommendedKW} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>kW</span>
                </div>
              </div>

              <div className="glass-card p-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="stat-label">PM Subsidy Eligible</span>
                  <CheckCircle2 size={16} color="#F59E0B" />
                </div>
                <div className="stat-value stat-value--amber" style={{ fontSize: '2.25rem', color: '#F59E0B' }}>
                  <CountUp end={subsidyAmount} prefix="₹" />
                </div>
              </div>
            </div>

            {/* 3. Main Chart & Solar Score */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              
              {/* ROI Line Chart */}
              <div className="glass-card p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>20-Year ROI & Savings Projection</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Comparing grid escalation vs cumulative solar savings</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px' }}>
                    {[10, 20, 25].map(span => (
                      <button key={span} type="button" onClick={() => setYearSpan(span as any)}
                        style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: yearSpan === span ? '#A8FF3E' : 'transparent',
                          color: yearSpan === span ? '#070D09' : 'var(--text-secondary)'
                        }}>
                        {span}Y
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: '300px' }}>
                  <Line data={roiChartData} options={roiChartOptions} />
                </div>
              </div>

              {/* Solar Score Breakdown */}
              <div className="glass-card p-6 flex-col">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Solar Score</h3>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A8FF3E', fontFamily: 'Outfit, sans-serif' }}>
                    {solarScore.overall}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
                <div className="score-bar-list">
                  <AnimatedBar value={solarScore.solarResource} label="Solar Resource (Irradiance)" delay={0} />
                  <AnimatedBar value={solarScore.energyFit} label="Energy & Load Fit" delay={150} />
                  <AnimatedBar value={solarScore.roofSuitability} label="Roof Usability" delay={300} />
                  <AnimatedBar value={solarScore.financialROI} label="Financial Payback" delay={450} />
                  <AnimatedBar value={solarScore.governmentSupport} label="Govt Policy & Subsidy" delay={600} />
                </div>
              </div>

            </div>

            {/* 4. Bottom Grid: Monthly Bill, Pie, Rate Card, AI Insight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card p-5">
                <h4 style={{ fontSize: '1rem', margin: '0 0 1rem 0' }}>Monthly Bill Comparison (₹)</h4>
                <div style={{ height: '180px' }}>
                  <Bar data={billChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>

              <div className="glass-card p-5 text-center">
                <h4 style={{ fontSize: '1rem', margin: '0 0 1rem 0' }}>Energy Source Mix</h4>
                <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
                  <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>

              <div className="glass-card p-5" style={{ background: 'rgba(168,255,62,0.04)', borderColor: 'rgba(168,255,62,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Sparkles color="#A8FF3E" size={24} />
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#F0FFF4' }}>Today's AI Solar Insight</h4>
                </div>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {insightText}<span className="streaming-cursor">|</span>
                </p>
              </div>
            </div>

          </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════════════
            OPTION 2: SOLAR FLARE BENTO (VIBRANT HIGH-CONTRAST BENTO GRID)
            ══════════════════════════════════════════════════════════════════════════ */}
        {dashboardOption === '2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Bento Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'
            }}>
              
              {/* Giant Solar Meter Hero Bento */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(20,15,5,0.95) 0%, rgba(245,158,11,0.12) 100%)',
                border: '2px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '24px', padding: '2.5rem', position: 'relative', overflow: 'hidden'
              }}>
                <div className="badge" style={{ background: '#F59E0B', color: '#000', fontWeight: 800, marginBottom: '1rem' }}>
                  🔥 SOLAR FLARE METRIC
                </div>
                <h1 style={{ fontSize: '2.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: '#FFF', margin: '0 0 0.5rem 0' }}>
                  {userName}'s Solar Score: <span style={{ color: '#F59E0B' }}>{solarScore.overall}</span>/100
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', margin: 0 }}>
                  Excellent solar potential in {userState} under {userDiscom}.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 }}>25-YR NET SAVINGS</span>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>₹{(roiData.roi25Year / 100000).toFixed(1)} Lakh</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 }}>PM SUBSIDY</span>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>₹{subsidyAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Bento Stat Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(15, 18, 24, 0.9)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '1.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 700 }}>MONTHLY SAVINGS</span>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF', margin: '0.5rem 0' }}>₹{monthlySavings.toLocaleString('en-IN')}</p>
                  <span style={{ fontSize: '0.75rem', color: '#4ADE80' }}>↑ 85% Bill Offset</span>
                </div>

                <div style={{ background: 'rgba(15, 18, 24, 0.9)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '1.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 700 }}>PAYBACK TIME</span>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF', margin: '0.5rem 0' }}>{paybackYears} Yrs</p>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Under PM Surya Ghar</span>
                </div>

                <div style={{ background: 'rgba(15, 18, 24, 0.9)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '1.5rem', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 700 }}>SYSTEM SIZING</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFF', margin: '0.25rem 0' }}>{recommendedKW} kW Rooftop Solar</p>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>Requires ~{Math.round(recommendedKW * 90)} sq ft shadow-free roof area</span>
                </div>
              </div>

            </div>

            {/* Bento ROI Chart Block */}
            <div style={{
              background: 'rgba(12, 14, 18, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '24px', padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#FFF' }}>Solar Flare ROI Trajectory</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[10, 20, 25].map(y => (
                    <button key={y} type="button" onClick={() => setYearSpan(y as any)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                        background: yearSpan === y ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                        color: yearSpan === y ? '#000' : '#FFF'
                      }}>
                      {y} Years
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: '320px' }}>
                <Line data={roiChartData} options={roiChartOptions} />
              </div>
            </div>

          </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════════════
            OPTION 3: CYBER DARK COMMAND (ENTERPRISE TELEMETRY CENTER)
            ══════════════════════════════════════════════════════════════════════════ */}
        {dashboardOption === '3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Cyber Header Telemetry Bar */}
            <div style={{
              background: 'rgba(8, 14, 22, 0.95)', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: '16px', padding: '1.25rem 2rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Activity size={24} color="#00F2FE" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#00F2FE', letterSpacing: '0.1em', fontWeight: 800 }}>SURYASETU TELEMETRY ENGINE</span>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: 0, color: '#FFF' }}>
                    {userName} // {userState} ({userDiscom})
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>GRID RATE:</span> <strong style={{ color: '#00F2FE' }}>₹{gridHistory[gridHistory.length-1]?.rate || 9.2}/kWh</strong></div>
                <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>ESCALATION:</span> <strong style={{ color: '#FF007A' }}>+7.8%/yr</strong></div>
                <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>SOLAR SCORE:</span> <strong style={{ color: '#00F2FE' }}>{solarScore.overall}/100</strong></div>
              </div>
            </div>

            {/* Cyber Tab Hub */}
            <div style={{
              background: 'rgba(8, 14, 22, 0.9)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '20px', padding: '2rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                {[
                  { id: 'roi', label: '📈 20-Yr Financial ROI' },
                  { id: 'bills', label: '📊 Monthly Bill Comparison' },
                  { id: 'score', label: '⚡ Solar Score Radar' }
                ].map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTabOption3(tab.id as any)}
                    style={{
                      padding: '10px 20px', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: activeTabOption3 === tab.id ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                      color: activeTabOption3 === tab.id ? '#00F2FE' : 'rgba(255,255,255,0.6)',
                      borderBottom: activeTabOption3 === tab.id ? '2px solid #00F2FE' : '2px solid transparent'
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTabOption3 === 'roi' && (
                <div style={{ height: '350px' }}>
                  <Line data={roiChartData} options={roiChartOptions} />
                </div>
              )}

              {activeTabOption3 === 'bills' && (
                <div style={{ height: '350px' }}>
                  <Bar data={billChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              )}

              {activeTabOption3 === 'score' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <AnimatedBar value={solarScore.solarResource} label="Solar Irradiance Resource" color="#00F2FE" delay={0} />
                  <AnimatedBar value={solarScore.energyFit} label="Energy Load Fit" color="#00F2FE" delay={150} />
                  <AnimatedBar value={solarScore.roofSuitability} label="Roof Usability" color="#00F2FE" delay={300} />
                  <AnimatedBar value={solarScore.financialROI} label="Financial Payback Score" color="#00F2FE" delay={450} />
                  <AnimatedBar value={solarScore.governmentSupport} label="Govt Policy & Subsidy" color="#00F2FE" delay={600} />
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
