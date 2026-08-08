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

export default function Dashboard() {
  const { userProfile } = useApp();
  const [yearSpan, setYearSpan] = useState<10 | 20 | 25>(20);

  /* ─ Profile values ─ */
  const name     = userProfile.firstName || userProfile.name || 'there';
  const state    = userProfile.state    || 'Maharashtra';
  const discom   = userProfile.discom   || 'Maha Vitaran';
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

  /* ─ ROI Chart Data ─ */
  const roiLabels = Array.from({ length: yearSpan + 1 }, (_, i) => (new Date().getFullYear() + i).toString());

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '32px 24px 80px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header (Ventriloc style) */}
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-mist)', paddingBottom: '20px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 400,
              letterSpacing: '-0.64px',
              lineHeight: 1.19,
              color: 'var(--color-graphite)',
              margin: 0,
            }}
          >
            Dashboard
          </h1>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge--success">
              <CheckCircle size={13} /> {schemes.length} Subsidies Active
            </span>
            <span className="badge badge--amber">
              <Sun size={13} /> {irradiance.average} PSH / Day
            </span>
          </div>
        </header>

        {/* ══ VENTRILOC DATA DASHBOARD GRID ══ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px',
          }}
        >
          {/* ── CARD 1: ASYMMETRIC OVERVIEW CARD (Span 5 cols) ── */}
          <div
            style={{
              gridColumn: 'span 5',
              background: 'var(--color-ash)',
              borderRadius: '6px 0px 0px 6px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                System Feasibility Synthesis
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                {sysKW} kW Solar PV Configuration
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-steel)', lineHeight: 1.6, marginBottom: '20px' }}>
                Based on your {discom} bill of ₹{avgBill.toLocaleString('en-IN')}/mo, installing a {sysKW} kW rooftop system offsets 82–95% of grid power with an estimated 25-year return of ₹{(roi.roi25Year / 100000).toFixed(1)} Lakh.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--color-mist)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase' }}>Required Area</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-graphite)' }}>~{Math.round(sysKW * 107)} sq ft</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase' }}>Daily Yield</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-graphite)' }}>~{(sysKW * 4.2).toFixed(1)} kWh/day</div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: MONTHLY SAVINGS (Span 4 cols) ── */}
          <div
            style={{
              gridColumn: 'span 4',
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>
                Est. Monthly Savings
              </span>
              <ArrowUpRight size={16} color="var(--color-ember-orange)" />
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, color: 'var(--color-ember-orange)', lineHeight: 1 }}>
                <CountUp end={monthlySavings} prefix="₹" />
                <span style={{ fontSize: '14px', color: 'var(--color-slate)', fontWeight: 400 }}> /mo</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px' }}>
                ~₹{(monthlySavings * 12).toLocaleString('en-IN')} annual bill reduction
              </div>
            </div>

            {/* Sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '24px' }}>
              {[35, 45, 60, 75, 90, 85, 100, 95, 90].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: '2px',
                    background: i >= 6 ? 'var(--color-ember-orange)' : 'var(--color-ash)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── CARD 3: SOLAR SCORE (Span 3 cols) ── */}
          <div
            style={{
              gridColumn: 'span 3',
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>
                Solar Score
              </span>
              <ArrowUpRight size={15} color="var(--color-slate)" />
            </div>

            <div style={{ margin: '8px 0' }}>
              <GaugeChart
                value={score.overall}
                size={110}
                thickness={8}
                color="var(--color-ember-orange)"
                label="Score"
                sublabel="/100"
              />
            </div>

            <span className="badge badge--success" style={{ fontSize: '11px' }}>
              OPTIMAL VIABILITY
            </span>
          </div>

          {/* ── CARD 4: PM SUBSIDY (Span 4 cols) ── */}
          <div
            style={{
              gridColumn: 'span 4',
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>
                PM Subsidy Eligible
              </span>
              <span className="badge badge--brass">DBT Surcharge</span>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--color-graphite)', lineHeight: 1 }}>
                <CountUp end={subsidy} prefix="₹" />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px' }}>
                PM Surya Ghar: Muft Bijli Yojana
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
              Direct Bank Transfer credited upon bi-directional meter commissioning.
            </div>
          </div>

          {/* ── CARD 5: PAYBACK HORIZON (Span 3 cols) ── */}
          <div
            style={{
              gridColumn: 'span 3',
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>
                Payback Period
              </span>
              <CurrencyInr size={16} color="var(--color-slate)" />
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--color-graphite)', lineHeight: 1 }}>
                <CountUp end={payback} decimals={1} suffix=" yrs" />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px' }}>
                Break-even timeline
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
              25-year linear performance warranty.
            </div>
          </div>

          {/* ── CARD 6: ENERGY OFFSET (Span 5 cols) ── */}
          <div
            style={{
              gridColumn: 'span 5',
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>
                Generation Offset
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-ember-orange)' }}>85% Offset</span>
            </div>

            {/* Segmented bar */}
            <div style={{ display: 'flex', gap: '6px', height: '14px', margin: '14px 0' }}>
              <div style={{ flex: 85, background: 'var(--color-ember-orange)', borderRadius: '3px' }} />
              <div style={{ flex: 15, background: 'var(--color-ash)', borderRadius: '3px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-steel)' }}>
              <span>● Solar Output: ~{(sysKW * 125).toFixed(0)} kWh/mo</span>
              <span style={{ color: 'var(--color-slate)' }}>● Grid Backup: ~35 kWh/mo</span>
            </div>
          </div>

          {/* ── CARD 7: ROI PROJECTION CHART (Span 12 cols) ── */}
          <div
            style={{
              gridColumn: 'span 12',
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
                  Financial Return Forecast
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>
                  Cumulative Grid Spend vs. Solar Savings ({yearSpan} Years)
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '4px', background: 'var(--color-ash)', padding: '4px', borderRadius: 'var(--radius-nav-pills)' }}>
                {([10, 20, 25] as const).map(y => (
                  <button
                    key={y}
                    onClick={() => setYearSpan(y)}
                    style={{
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-nav-pills)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 400,
                      border: 'none',
                      cursor: 'pointer',
                      background: yearSpan === y ? 'var(--color-canvas-white)' : 'transparent',
                      color: yearSpan === y ? 'var(--color-graphite)' : 'var(--color-slate)',
                      boxShadow: yearSpan === y ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {y} Years
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '260px' }}>
              <LineChart
                labels={roiLabels}
                datasets={[
                  {
                    label: 'Grid Cost (No Solar)',
                    data: Array.from({ length: yearSpan + 1 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12)),
                    color: '#816729',
                    fillColor: 'rgba(129, 103, 41, 0.04)',
                    borderWidth: 1.5,
                  },
                  {
                    label: 'Solar Cumulative Savings',
                    data: roi.yearlyData.slice(0, yearSpan + 1).map(y => Math.max(0, y.cumulative)),
                    color: '#ff682c',
                    fillColor: 'rgba(255, 104, 44, 0.06)',
                    borderWidth: 2,
                  }
                ]}
                height="100%"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-steel)', borderTop: '1px solid var(--color-mist)', paddingTop: '16px', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 12, height: 3, borderRadius: 2, background: '#816729', display: 'inline-block' }} /> Grid Cost Escalation (7.8%/yr)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 12, height: 3, borderRadius: 2, background: '#ff682c', display: 'inline-block' }} /> Net Solar Savings
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-ember-orange)' }}>
                Net {yearSpan}-Year Savings: +₹{(roi.yearlyData[yearSpan]?.cumulative || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
