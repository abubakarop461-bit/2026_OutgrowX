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
import { GaugeChart, LineChart } from '../../components/ui/bklit';
import {
  TrendUp, CurrencyInr, CheckCircle, Sparkle, Sun,
  Lightning, BatteryCharging, ChartBar, ArrowUpRight
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { calculateROI, getStateGridHistory } from '../../services/roiCalculator';
import { calculateSolarScore } from '../../services/solarScorer';
import { checkSubsidyEligibility } from '../../data/govtSchemes';
import { getSolarHoursPerDay } from '../../data/solarIrradiance';

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
      const p = Math.min((ts - start) / 1200, 1);
      setCount((1 - Math.pow(2, -10 * p)) * end);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

/* ─── Shared chart defaults ─── */
const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#4A6055', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4A6055', font: { size: 10 } } }
  },
  responsive: true,
  maintainAspectRatio: false,
};

export default function Dashboard() {
  const { userProfile } = useApp();
  const { t } = useTranslation();
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
  const schemes      = checkSubsidyEligibility(userProfile as any);
  const irradiance   = getSolarHoursPerDay(state);

  const monthlySavings = Math.round(roi.annualSavings / 12);
  const payback        = roi.paybackYears;
  const sysKW          = roi.systemSizeKW;
  const subsidy        = roi.subsidy;

  /* ─ Streaming insight ─ */
  const full = `Based on ${discom}'s 7.8% annual grid rate growth, going solar today saves ₹${monthlySavings.toLocaleString('en-IN')}/month and ₹${(roi.roi25Year / 100000).toFixed(1)} Lakh over 25 years.`;
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { setInsightText(full.slice(0, i++)); if (i > full.length) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [full]);

  /* ─ ROI Chart Data ─ */
  const roiLabels = Array.from({ length: yearSpan + 1 }, (_, i) => (new Date().getFullYear() + i).toString());
  const roiChartData = {
    labels: roiLabels,
    datasets: [
      {
        label: 'Grid Cost (No Solar)',
        data: Array.from({ length: yearSpan + 1 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12)),
        borderColor: 'rgba(249,115,22,0.65)',
        backgroundColor: 'rgba(249,115,22,0.06)',
        fill: true, tension: 0.4, borderWidth: 1.5,
      },
      {
        label: 'Solar Cumulative Savings',
        data: roi.yearlyData.slice(0, yearSpan + 1).map(y => Math.max(0, y.cumulative)),
        borderColor: '#A8FF3E',
        backgroundColor: 'rgba(168,255,62,0.08)',
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
      x: { grid: { display: false }, ticks: { color: '#4A6055', font: { size: 10 } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#4A6055', font: { size: 10 }, callback: v => '₹' + (Number(v) / 100000).toFixed(0) + 'L' }
      }
    }
  };

  return (
    <div style={{
      height: 'calc(100vh - 72px)',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: '#070D09',
      padding: '0.875rem 1.25rem',
      color: '#ECF2EE',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* ══ EKOVA-INSPIRED BENTO GRID ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: '1.2fr 1.6fr 1fr',
        gap: '0.875rem',
        flex: 1,
        height: '100%',
        minHeight: 0,
      }}>

        {/* ── CARD 1: WELCOME HERO (Span 5 cols, Row 1) ── */}
        <div style={{
          gridColumn: 'span 5',
          background: 'radial-gradient(ellipse at top left, rgba(168,255,62,0.08) 0%, rgba(10,18,13,0.92) 75%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle background solar texture glow */}
          <div style={{
            position: 'absolute', right: '-20px', bottom: '-20px',
            width: '180px', height: '180px',
            background: 'radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#7A9484', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', animation: 'pulse-dot 2s infinite' }} />
                Live · Solar Intelligence
              </span>
              <span style={{ fontSize: '0.625rem', color: '#4A6055' }}>
                {state} · {discom}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem',
              fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.375rem', color: '#ECF2EE'
            }}>
              {t('dashWelcome')}, <span style={{ color: '#A8FF3E' }}>{name}.</span>
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#7A9484', margin: 0, lineHeight: 1.45 }}>
              {t('dashOverview')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '0.75rem', fontWeight: 600, color: '#22C55E',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
              padding: '4px 10px', borderRadius: '999px'
            }}>
              <CheckCircle size={13} weight="duotone" />
              {schemes.length} {t('subsidyEligible')}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '0.75rem', fontWeight: 600, color: '#A8FF3E',
              background: 'rgba(168,255,62,0.08)', border: '1px solid rgba(168,255,62,0.18)',
              padding: '4px 10px', borderRadius: '999px'
            }}>
              <Sun size={13} weight="duotone" />
              {irradiance.average} PSH / Day
            </div>
          </div>
        </div>

        {/* ── CARD 2: MONTHLY SAVINGS (Span 4 cols, Row 1) ── */}
        <div style={{
          gridColumn: 'span 4',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168,255,62,0.18)', borderRadius: '18px',
          padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
              {t('monthlySavings')}
            </span>
            <ArrowUpRight size={16} weight="bold" color="#A8FF3E" />
          </div>

          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.125rem', fontWeight: 800, color: '#A8FF3E', lineHeight: 1.1 }}>
              <CountUp end={monthlySavings} prefix="₹" />
              <span style={{ fontSize: '0.875rem', color: '#7A9484', fontWeight: 500 }}> /mo</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px' }}>
              ~₹{(monthlySavings * 12).toLocaleString('en-IN')} / year offset
            </div>
          </div>

          {/* Mini Sparkline Bar Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px', alignContent: 'flex-end', marginTop: '6px' }}>
            {[35, 45, 60, 75, 90, 85, 100, 95, 90].map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: '3px',
                background: i >= 6 ? '#A8FF3E' : 'rgba(168,255,62,0.25)'
              }} />
            ))}
          </div>
        </div>

        {/* ── CARD 3: SOLAR SCORE (Span 3 cols, Row 1) ── */}
        <div style={{
          gridColumn: 'span 3',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          padding: '1.25rem 1.25rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'center', textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
              Solar Score
            </span>
            <ArrowUpRight size={16} weight="bold" color="#7A9484" />
          </div>

          {/* BKLIT.ui Gauge Chart (@bklit/gauge-chart) */}
          <div style={{ margin: '0.25rem 0' }}>
            <GaugeChart
              value={score.overall}
              size={110}
              thickness={9}
              color="#A8FF3E"
              label="Solar Score"
              sublabel="/100 overall"
            />
          </div>

          <span style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 700, background: 'rgba(34,197,94,0.1)', padding: '2px 10px', borderRadius: '999px' }}>
            OPTIMAL SUITABILITY
          </span>
        </div>

        {/* ── CARD 4: TOTAL ENERGY / RECOMMENDED KW (Span 3 cols, Row 2) ── */}
        <div style={{
          gridColumn: 'span 3',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
              Recommended System
            </span>
            <ArrowUpRight size={16} weight="bold" color="#7A9484" />
          </div>

          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#ECF2EE', lineHeight: 1 }}>
              {sysKW} <span style={{ fontSize: '1rem', color: '#7A9484', fontWeight: 600 }}>kW</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px' }}>
              ~{Math.round(sysKW * 90)} sq ft shadow-free roof
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#4A6055', marginBottom: '4px' }}>
              <span>Generation Potential</span>
              <span style={{ color: '#A8FF3E', fontWeight: 700 }}>~4,900 kWh/yr</span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: '#A8FF3E', borderRadius: '999px' }} />
            </div>
          </div>
        </div>

        {/* ── CARD 5: PM SUBSIDY / EARNING (Span 3 cols, Row 2) ── */}
        <div style={{
          gridColumn: 'span 3',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
              PM Subsidy Eligible
            </span>
            <ArrowUpRight size={16} weight="bold" color="#F59E0B" />
          </div>

          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
              <CountUp end={subsidy} prefix="₹" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px' }}>
              Direct Bank Transfer (DBT) credit
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#22C55E', background: 'rgba(34,197,94,0.08)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.18)' }}>
            PM Surya Ghar Muft Bijli Yojana
          </div>
        </div>

        {/* ── CARD 6: ROI PROJECTION CHART (Span 6 cols, Rows 2-3) ── */}
        <div style={{
          gridColumn: 'span 6',
          gridRow: 'span 2',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
                {yearSpan}-Year Cumulative ROI
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: '2px 0 0', color: '#ECF2EE' }}>
                Grid Cost vs Solar Savings
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px' }}>
              {( [10, 20, 25] as const).map(y => (
                <button key={y} onClick={() => setYearSpan(y)} style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: yearSpan === y ? 'rgba(168,255,62,0.18)' : 'transparent',
                  color: yearSpan === y ? '#A8FF3E' : '#7A9484',
                }}>{y}Y</button>
              ))}
            </div>
          </div>

          {/* BKLIT.ui Line Chart (@bklit/line-chart) */}
          <div style={{ flex: 1, minHeight: 0, margin: '0.5rem 0' }}>
            <LineChart
              labels={roiLabels}
              datasets={[
                {
                  label: 'Grid Cost (No Solar)',
                  data: Array.from({ length: yearSpan + 1 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12)),
                  color: 'rgba(249,115,22,0.75)',
                  fillColor: 'rgba(249,115,22,0.06)',
                  borderWidth: 1.5,
                },
                {
                  label: 'Solar Cumulative Savings',
                  data: roi.yearlyData.slice(0, yearSpan + 1).map(y => Math.max(0, y.cumulative)),
                  color: '#A8FF3E',
                  fillColor: 'rgba(168,255,62,0.08)',
                  borderWidth: 2,
                }
              ]}
              height="100%"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#7A9484', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: 'rgba(249,115,22,0.7)', display: 'inline-block' }} /> Grid Cost
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: '#A8FF3E', display: 'inline-block' }} /> Solar Savings
            </span>
            <span style={{ fontWeight: 700, color: '#A8FF3E' }}>
              Net 25Y ROI: +₹{(roi.roi25Year / 100000).toFixed(1)}L
            </span>
          </div>
        </div>

        {/* ── CARD 7: PAYBACK PERIOD (Span 2 cols, Row 3) ── */}
        <div style={{
          gridColumn: 'span 2',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
              Payback Period
            </span>
            <CurrencyInr size={15} weight="duotone" color="#7A9484" />
          </div>

          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#ECF2EE', lineHeight: 1 }}>
              <CountUp end={payback} decimals={1} suffix=" yrs" />
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#7A9484', marginTop: '3px' }}>
              25-year module warranty
            </div>
          </div>
        </div>

        {/* ── CARD 8: ENERGY FLOW & OFFSET (Span 4 cols, Row 3) ── */}
        <div style={{
          gridColumn: 'span 4',
          background: 'rgba(10,18,13,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484' }}>
              Energy Flow &amp; Offset
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A8FF3E' }}>82% Offset</span>
          </div>

          {/* Segmented Flow Bar */}
          <div style={{ display: 'flex', gap: '6px', height: '14px', margin: '4px 0' }}>
            <div style={{ flex: 82, background: '#A8FF3E', borderRadius: '6px' }} title="82% Solar Power" />
            <div style={{ flex: 18, background: 'rgba(255,255,255,0.12)', borderRadius: '6px' }} title="18% Grid Backup" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#7A9484' }}>
            <span style={{ color: '#A8FF3E', fontWeight: 600 }}>● Solar: 400 kWh/mo</span>
            <span style={{ color: '#7A9484' }}>● Grid: 70 kWh/mo</span>
          </div>
        </div>

      </div>
    </div>
  );
}
