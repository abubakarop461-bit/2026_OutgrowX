import React, { useState, useEffect } from 'react';
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
import { TrendingUp, DollarSign, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { calculateROI, getStateGridHistory } from '../../services/roiCalculator';
import { calculateSolarScore } from '../../services/solarScorer';
import { checkSubsidyEligibility } from '../../data/govtSchemes';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

/* ─── CountUp animation ─── */
const CountUp: React.FC<{ end: number; prefix?: string; suffix?: string; decimals?: number }> = ({
  end, prefix = '', suffix = '', decimals = 0
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      setCount((1 - Math.pow(2, -10 * p)) * end);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

/* ─── Animated horizontal score bar ─── */
const ScoreBar: React.FC<{ label: string; value: number; delay?: number }> = ({ label, value, delay = 0 }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 120 + delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      </div>
      <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '999px', width: `${w}%`,
          background: 'linear-gradient(90deg, #22C55E 0%, #A8FF3E 100%)',
          transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 8px rgba(168,255,62,0.35)'
        }} />
      </div>
    </div>
  );
};

/* ─── Shared chart defaults ─── */
const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6B8075', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6B8075', font: { size: 11 } } }
  },
  responsive: true,
  maintainAspectRatio: false,
};

/* ═══════════════════════════════════════════════════════
   DASHBOARD — Glass Emerald (Option 1, locked)
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { userProfile } = useApp();
  const [yearSpan, setYearSpan] = useState<10 | 20 | 25>(20);
  const [insightText, setInsightText] = useState('');

  /* ─ Profile values ─ */
  const name     = userProfile.firstName || userProfile.name || 'there';
  const state    = userProfile.state    || 'Maharashtra';
  const discom   = userProfile.discom   || 'MSEDCL';
  const avgBill  = Number(userProfile.avgBill || userProfile.billAmount || 3200);

  /* ─ Calculations ─ */
  const roi          = calculateROI(userProfile as any);
  const score        = calculateSolarScore(userProfile as any);
  const gridHistory  = getStateGridHistory(state, discom);
  const schemes      = checkSubsidyEligibility(userProfile as any);

  const monthlySavings = Math.round(roi.annualSavings / 12);
  const payback        = roi.paybackYears;
  const sysKW          = roi.systemSizeKW;
  const subsidy        = roi.subsidy;

  /* ─ Streaming insight ─ */
  const full = `Based on ${discom}'s average 7.8 % annual tariff growth, going solar today can save ₹${monthlySavings.toLocaleString('en-IN')}/month and ₹${(roi.roi25Year / 100000).toFixed(1)} Lakh over 25 years.`;
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { setInsightText(full.slice(0, i++)); if (i > full.length) clearInterval(id); }, 18);
    return () => clearInterval(id);
  }, [full]);

  /* ─ ROI Chart ─ */
  const roiLabels = Array.from({ length: yearSpan + 1 }, (_, i) => (new Date().getFullYear() + i).toString());
  const roiChartData = {
    labels: roiLabels,
    datasets: [
      {
        label: 'Grid Cost (No Solar)',
        data: Array.from({ length: yearSpan + 1 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12)),
        borderColor: 'rgba(249,115,22,0.7)',
        backgroundColor: 'rgba(249,115,22,0.07)',
        fill: true, tension: 0.4, borderWidth: 1.5,
      },
      {
        label: 'Solar Cumulative Savings',
        data: roi.yearlyData.slice(0, yearSpan + 1).map(y => Math.max(0, y.cumulative)),
        borderColor: 'rgba(168,255,62,0.8)',
        backgroundColor: 'rgba(168,255,62,0.07)',
        fill: true, tension: 0.4, borderWidth: 2,
      }
    ]
  };
  const roiOptions: ChartOptions<'line'> = {
    ...(chartDefaults as any),
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index', intersect: false,
        callbacks: { label: c => c.parsed.y != null ? `₹${(c.parsed.y / 100000).toFixed(1)}L` : '' }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6B8075', font: { size: 11 } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#6B8075', font: { size: 11 }, callback: v => '₹' + (Number(v) / 100000).toFixed(0) + 'L' }
      }
    }
  };

  /* ─ Bill Comparison Bar ─ */
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const billData = {
    labels: months,
    datasets: [
      {
        label: 'Before Solar',
        data: [0.9, 0.95, 1.1, 1.25, 1.3, 1.05].map(m => Math.round(avgBill * m)),
        backgroundColor: 'rgba(249,115,22,0.55)',
        borderRadius: 5, borderSkipped: false,
      },
      {
        label: 'After Solar',
        data: [0.15, 0.15, 0.2, 0.25, 0.25, 0.18].map(m => Math.round(avgBill * m)),
        backgroundColor: 'rgba(168,255,62,0.65)',
        borderRadius: 5, borderSkipped: false,
      }
    ]
  };

  /* ─ Pie Chart ─ */
  const pieData = {
    labels: ['Solar', 'Grid'],
    datasets: [{
      data: [82, 18],
      backgroundColor: ['rgba(168,255,62,0.75)', 'rgba(255,255,255,0.08)'],
      borderWidth: 0,
    }]
  };

  /* ─ Reusable KPI card ─ */
  const KpiCard = ({ label, children, accent = false, icon }: {
    label: string; children: React.ReactNode; accent?: boolean; icon?: React.ReactNode;
  }) => (
    <div style={{
      background: 'rgba(10,20,13,0.75)',
      backdropFilter: 'blur(20px)',
      border: accent ? '1px solid rgba(168,255,62,0.18)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '1.5rem 1.75rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = accent ? 'rgba(168,255,62,0.32)' : 'rgba(255,255,255,0.12)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = accent ? '0 8px 32px rgba(168,255,62,0.10)' : '0 8px 24px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = accent ? 'rgba(168,255,62,0.18)' : 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5A7A66' }}>{label}</span>
        {icon && <span style={{ color: accent ? '#A8FF3E' : '#5A7A66' }}>{icon}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      padding: '2rem 1.5rem',
      color: 'var(--text-primary)',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Ambient glow — top right, very subtle */}
      <div style={{
        position: 'fixed', top: 0, right: '15%', width: '600px', height: '500px',
        background: 'radial-gradient(circle at 60% 20%, rgba(168,255,62,0.045) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ══ HEADER ══ */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#A8FF3E', background: 'rgba(168,255,62,0.08)', border: '1px solid rgba(168,255,62,0.16)',
              padding: '3px 10px', borderRadius: '999px', marginBottom: '0.75rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A8FF3E', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              Live · Solar Intelligence
            </div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#ECF8F0',
            }}>
              Good morning, {name} ☀️
            </h1>
            <p style={{ margin: '0.375rem 0 0', fontSize: '1rem', color: '#5A7A66' }}>
              {state} · <span style={{ color: '#8BAF95' }}>{discom}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5A7A66',
              fontSize: '0.8125rem', marginBottom: '0.5rem', justifyContent: 'flex-end',
            }}>
              <Calendar size={14} style={{ color: '#5A7A66' }} />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{
              display: 'inline-flex', gap: '6px', alignItems: 'center',
              fontSize: '0.75rem', color: '#5A7A66', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '999px',
            }}>
              <CheckCircle2 size={13} style={{ color: '#22C55E' }} />
              {schemes.length} subsidy schemes eligible
            </div>
          </div>
        </header>

        {/* ══ KPI STRIP ══ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem', marginBottom: '1.75rem',
        }}>
          <KpiCard label="Monthly Savings" accent icon={<TrendingUp size={15} />}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#A8FF3E', lineHeight: 1.1 }}>
              <CountUp end={monthlySavings} prefix="₹" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 700 }}>↑ ~85%</span>
              <span style={{ fontSize: '0.75rem', color: '#5A7A66' }}>bill offset post-solar</span>
            </div>
          </KpiCard>

          <KpiCard label="Payback Period" icon={<DollarSign size={15} />}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ECF8F0', lineHeight: 1.1 }}>
              <CountUp end={payback} decimals={1} suffix=" yrs" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#5A7A66', marginTop: '4px' }}>Under PM Surya Ghar</div>
          </KpiCard>

          <KpiCard label="Recommended System">
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ECF8F0', lineHeight: 1.1 }}>
              {sysKW} <span style={{ fontSize: '1.125rem', color: '#5A7A66', fontWeight: 600 }}>kW</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#5A7A66', marginTop: '4px' }}>~{Math.round(sysKW * 90)} sq ft roof required</div>
          </KpiCard>

          <KpiCard label="PM Subsidy Eligible" icon={<CheckCircle2 size={15} />}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#F59E0B', lineHeight: 1.1 }}>
              <CountUp end={subsidy} prefix="₹" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#5A7A66', marginTop: '4px' }}>Direct bank transfer (DBT)</div>
          </KpiCard>
        </div>

        {/* ══ MAIN CHARTS ROW ══ */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 340px',
          gap: '1.25rem', marginBottom: '1.25rem',
        }}>

          {/* ROI Area Chart */}
          <div style={{
            background: 'rgba(10,20,13,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem 2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: '#ECF8F0' }}>
                  {yearSpan}-Year ROI Projection
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#5A7A66', margin: '2px 0 0' }}>
                  Grid escalation vs cumulative solar savings
                </p>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
                {([10, 20, 25] as const).map(y => (
                  <button key={y} onClick={() => setYearSpan(y)} style={{
                    padding: '5px 12px', borderRadius: '7px', fontSize: '0.8125rem', fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: yearSpan === y ? 'rgba(255,255,255,0.10)' : 'transparent',
                    color: yearSpan === y ? '#ECF8F0' : '#5A7A66',
                    transition: 'all 150ms ease',
                  }}>{y}Y</button>
                ))}
              </div>
            </div>

            {/* Chart legend */}
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#5A7A66' }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: 'rgba(249,115,22,0.7)' }} />
                Grid cost (no solar)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#5A7A66' }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: 'rgba(168,255,62,0.8)' }} />
                Solar savings
              </div>
            </div>

            <div style={{ height: '260px' }}>
              <Line data={roiChartData} options={roiOptions} />
            </div>
          </div>

          {/* Solar Score */}
          <div style={{
            background: 'rgba(10,20,13,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem 2rem',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: '#ECF8F0' }}>
                Solar Score
              </h3>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#A8FF3E', lineHeight: 1 }}>
                  {score.overall}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#5A7A66', fontWeight: 600 }}>/100 overall</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <ScoreBar label="Solar Resource"       value={score.solarResource}     delay={0} />
              <ScoreBar label="Energy Load Fit"      value={score.energyFit}         delay={100} />
              <ScoreBar label="Roof Suitability"     value={score.roofSuitability}   delay={200} />
              <ScoreBar label="Financial Payback"    value={score.financialROI}      delay={300} />
              <ScoreBar label="Govt Policy Support"  value={score.governmentSupport} delay={400} />
            </div>
          </div>
        </div>

        {/* ══ BOTTOM ROW ══ */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1.25rem',
        }}>

          {/* Monthly Bill Comparison */}
          <div style={{
            background: 'rgba(10,20,13,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem 2rem',
          }}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#ECF8F0' }}>
              Monthly Bill (Before vs After)
            </h4>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#5A7A66' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(249,115,22,0.55)' }} /> Before
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#5A7A66' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(168,255,62,0.65)' }} /> After
              </div>
            </div>
            <div style={{ height: '170px' }}>
              <Bar data={billData} options={chartDefaults as any} />
            </div>
          </div>

          {/* Energy Mix Pie */}
          <div style={{
            background: 'rgba(10,20,13,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 1rem', color: '#ECF8F0', alignSelf: 'flex-start' }}>
              Energy Source Mix
            </h4>
            <div style={{ height: '140px', width: '140px', marginBottom: '1rem' }}>
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8BAF95' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(168,255,62,0.75)', display: 'inline-block' }} />
                  Solar
                </span>
                <span style={{ fontWeight: 700, color: '#ECF8F0' }}>82%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8BAF95' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
                  Grid
                </span>
                <span style={{ fontWeight: 700, color: '#ECF8F0' }}>18%</span>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div style={{
            background: 'rgba(10,20,13,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem 2rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '180px', height: '180px',
              background: 'radial-gradient(circle at 80% 10%, rgba(168,255,62,0.05) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '10px',
                background: 'rgba(168,255,62,0.08)', border: '1px solid rgba(168,255,62,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#A8FF3E" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ECF8F0', fontFamily: 'Outfit, sans-serif' }}>AI Insight</div>
                <div style={{ fontSize: '0.6875rem', color: '#5A7A66', fontWeight: 600 }}>Solar Pro Advisor · Live</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#8BAF95', margin: 0 }}>
              {insightText}
              <span style={{ color: '#A8FF3E', animation: 'blink 0.9s step-start infinite' }}>▊</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
