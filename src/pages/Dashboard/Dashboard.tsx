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
  const { userProfile, language, blogArticles } = useApp();
  const [yearSpan, setYearSpan] = useState<10 | 20 | 25>(20);

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

  /* ─ ROI Chart Data ─ */
  const roiLabels = Array.from({ length: yearSpan + 1 }, (_, i) => (new Date().getFullYear() + i).toString());

  /* ─ Local Translation dictionary ─ */
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  
  const strings = {
    feasibilitySynthesis: isHi ? "सिस्टम व्यवहार्यता संश्लेषण" : isMr ? "सिस्टम व्यवहार्यता विश्लेषण" : "System Feasibility Synthesis",
    pvConfig: isHi ? `${sysKW} kW सौर पीवी विन्यास` : isMr ? `${sysKW} kW सोलर पीव्ही रचना` : `${sysKW} kW Solar PV Configuration`,
    feasibilityDesc: isHi 
      ? `आपके ${discom} के ₹${avgBill.toLocaleString('en-IN')}/माह के बिल के आधार पर, ${sysKW} kW का रूफटॉप सिस्टम ग्रिड बिजली की 82–95% भरपाई करता है, जिसमें 25 वर्षों में लगभग ₹${(roi.roi25Year / 100000).toFixed(1)} लाख की बचत होगी।` 
      : isMr 
        ? `तुमच्या ${discom} च्या ₹${avgBill.toLocaleString('en-IN')}/महिना बिलाच्या आधारे, ${sysKW} kW ची छतावरील सोलर प्रणाली ग्रीड विजेचे 82–95% कमी करते, ज्यामध्ये 25 वर्षात अंदाजे ₹${(roi.roi25Year / 100000).toFixed(1)} लाख परतावा मिळेल.` 
        : `Based on your ${discom} bill of ₹${avgBill.toLocaleString('en-IN')}/mo, installing a ${sysKW} kW rooftop system offsets 82–95% of grid power with an estimated 25-year return of ₹${(roi.roi25Year / 100000).toFixed(1)} Lakh.`,
    requiredArea: isHi ? "आवश्यक क्षेत्र" : isMr ? "आवश्यक जागा" : "Required Area",
    dailyYield: isHi ? "दैनिक उत्पादन" : isMr ? "दैनिक निर्मिती" : "Daily Yield",
    monthlySavings: isHi ? "अनुमानित मासिक बचत" : isMr ? "अंदाजे मासिक बचत" : "Est. Monthly Savings",
    annualSavingsTip: isHi ? `~₹${(monthlySavings * 12).toLocaleString('en-IN')} वार्षिक बिल कटौती` : isMr ? `~₹${(monthlySavings * 12).toLocaleString('en-IN')} वार्षिक बिलात बचत` : `~₹${(monthlySavings * 12).toLocaleString('en-IN')} annual bill reduction`,
    solarScore: isHi ? "सोलर स्कोर" : isMr ? "सोलर स्कोर" : "Solar Score",
    optimalViability: isHi ? "इष्टतम व्यवहार्यता" : isMr ? "योग्य व्यवहार्यता" : "OPTIMAL VIABILITY",
    pmSubsidy: isHi ? "पीएम सब्सिडी पात्र" : isMr ? "पीएम अनुदान पात्र" : "PM Subsidy Eligible",
    dbtSurcharge: isHi ? "डीबीटी डायरेक्ट बैंक ट्रांसफर" : isMr ? "थेट बँक हस्तांतरण" : "DBT Direct Bank",
    pmSuryaGhar: isHi ? "पीएम सूर्य घर: मुफ्त बिजली योजना" : isMr ? "पीएम सूर्य घर: मोफत वीज योजना" : "PM Surya Ghar: Muft Bijli Yojana",
    dbtDisclaimer: isHi ? "द्वि-दिशात्मक मीटर चालू होने पर सीधे बैंक खाते में क्रेडिट किया जाएगा।" : isMr ? "द्वि-दिशानिर्देशित मीटर बसवल्यावर थेट बँक खात्यात जमा केले जाईल." : "Direct Bank Transfer credited upon bi-directional meter commissioning.",
    paybackPeriod: isHi ? "पेबैक अवधि" : isMr ? "पेबॅक कालावधी" : "Payback Period",
    breakevenTimeline: isHi ? "निवेश वसूली समयसीमा" : isMr ? "गुंतवणूक परतावा कालावधी" : "Break-even timeline",
    warrantyDisclaimer: isHi ? "25 साल की रैखिक प्रदर्शन वारंटी।" : isMr ? "25 वर्षे रेखीय कार्यक्षमता हमी." : "25-year linear performance warranty.",
    genOffset: isHi ? "उत्पादन भरपाई" : isMr ? "उत्पादन बचत" : "Generation Offset",
    offsetPercent: isHi ? "85% ऑफसेट" : isMr ? "85% बचत" : "85% Offset",
    solarOutput: isHi ? `● सौर उत्पादन: ~${(sysKW * 125).toFixed(0)} kWh/माह` : isMr ? `● सोलर निर्मिती: ~${(sysKW * 125).toFixed(0)} kWh/महिना` : `● Solar Output: ~${(sysKW * 125).toFixed(0)} kWh/mo`,
    gridBackup: isHi ? "● ग्रिड बैकअप: ~35 kWh/माह" : isMr ? "● ग्रीड बॅकअप: ~35 kWh/महिना" : "● Grid Backup: ~35 kWh/mo",
    financialForecast: isHi ? "वित्तीय परतावा पूर्वानुमान" : isMr ? "वित्तीय परतावा अंदाज" : "Financial Return Forecast",
    chartTitle: isHi ? "संचयी ग्रिड व्यय बनाम सौर बचत" : isMr ? "एकत्रित ग्रीड खर्च विरुद्ध सोलर बचत" : "Cumulative Grid Spend vs. Solar Savings",
    years: isHi ? "वर्ष" : isMr ? "वर्षे" : "Years",
    gridCostNoSolar: isHi ? "ग्रिड खर्च (बिना सोलर)" : isMr ? "ग्रीड खर्च (सोलरशिवाय)" : "Grid Cost (No Solar)",
    solarCumulativeSavings: isHi ? "सौर संचयी बचत" : isMr ? "सोलर एकत्रित बचत" : "Solar Cumulative Savings",
    gridEscalation: isHi ? "ग्रिड लागत वृद्धि (7.8%/वर्ष)" : isMr ? "ग्रीड दर वाढ (7.8%/वर्ष)" : "Grid Cost Escalation (7.8%/yr)",
    netSolarSavingsLabel: isHi ? "नेट सौर बचत" : isMr ? "निव्वळ सोलर बचत" : "Net Solar Savings",
    netSavingsForecast: isHi ? `नेट ${yearSpan}-वर्षीय बचत: +₹${(roi.yearlyData[yearSpan]?.cumulative || 0).toLocaleString('en-IN')}` : isMr ? `निव्वळ ${yearSpan}-वर्षांची बचत: +₹${(roi.yearlyData[yearSpan]?.cumulative || 0).toLocaleString('en-IN')}` : `Net ${yearSpan}-Year Savings: +₹${(roi.yearlyData[yearSpan]?.cumulative || 0).toLocaleString('en-IN')}`,
    latestInsights: isHi ? "नवीनतम सौर समाचार एवं विश्लेषण" : isMr ? "नवीनतम सोलर बातम्या आणि विश्लेषण" : "Latest Solar News & Analysis"
  };

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '12px 24px 80px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                {strings.feasibilitySynthesis}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                {strings.pvConfig}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-steel)', lineHeight: 1.6, marginBottom: '20px' }}>
                {strings.feasibilityDesc}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--color-mist)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase' }}>{strings.requiredArea}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-graphite)' }}>~{Math.round(sysKW * 107)} sq ft</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase' }}>{strings.dailyYield}</div>
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
                {strings.monthlySavings}
              </span>
              <ArrowUpRight size={16} color="var(--color-ember-orange)" />
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, color: 'var(--color-ember-orange)', lineHeight: 1 }}>
                <CountUp end={monthlySavings} prefix="₹" />
                <span style={{ fontSize: '14px', color: 'var(--color-slate)', fontWeight: 400 }}> /mo</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px' }}>
                {strings.annualSavingsTip}
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
                {strings.solarScore}
              </span>
              <ArrowUpRight size={15} color="var(--color-slate)" />
            </div>

            <div style={{ margin: '8px 0' }}>
              <GaugeChart
                value={score.overall}
                size={110}
                thickness={8}
                color="var(--color-ember-orange)"
                label={isHi ? "स्कोर" : isMr ? "गुण" : "Score"}
                sublabel="/100"
              />
            </div>

            <span className="badge badge--success" style={{ fontSize: '11px' }}>
              {strings.optimalViability}
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
                {strings.pmSubsidy}
              </span>
              <span className="badge badge--brass">{strings.dbtSurcharge}</span>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--color-graphite)', lineHeight: 1 }}>
                <CountUp end={subsidy} prefix="₹" />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px' }}>
                {strings.pmSuryaGhar}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-slate)', lineHeight: 1.4 }}>
              {strings.dbtDisclaimer}
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
                {strings.paybackPeriod}
              </span>
              <CurrencyInr size={16} color="var(--color-slate)" />
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--color-graphite)', lineHeight: 1 }}>
                <CountUp end={payback} decimals={1} suffix={isHi ? " वर्ष" : isMr ? " वर्षे" : " yrs"} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px' }}>
                {strings.breakevenTimeline}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
              {strings.warrantyDisclaimer}
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
                {strings.genOffset}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-ember-orange)' }}>{strings.offsetPercent}</span>
            </div>

            {/* Segmented bar */}
            <div style={{ display: 'flex', gap: '6px', height: '14px', margin: '14px 0' }}>
              <div style={{ flex: 85, background: 'var(--color-ember-orange)', borderRadius: '3px' }} />
              <div style={{ flex: 15, background: 'var(--color-ash)', borderRadius: '3px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-steel)' }}>
              <span>{strings.solarOutput}</span>
              <span style={{ color: 'var(--color-slate)' }}>{strings.gridBackup}</span>
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
                  {strings.financialForecast}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>
                  {strings.chartTitle} ({yearSpan} {strings.years})
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
                    {y} {strings.years}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '260px' }}>
              <LineChart
                labels={roiLabels}
                datasets={[
                  {
                    label: strings.gridCostNoSolar,
                    data: Array.from({ length: yearSpan + 1 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12)),
                    color: '#816729',
                    fillColor: 'rgba(129, 103, 41, 0.04)',
                    borderWidth: 1.5,
                  },
                  {
                    label: strings.solarCumulativeSavings,
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
                  <span style={{ width: 12, height: 3, borderRadius: 2, background: '#816729', display: 'inline-block' }} /> {strings.gridEscalation}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 12, height: 3, borderRadius: 2, background: '#ff682c', display: 'inline-block' }} /> {strings.netSolarSavingsLabel}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-ember-orange)' }}>
                {strings.netSavingsForecast}
              </div>
            </div>
          </div>

          {/* ── CARD 8: INFINITE SCROLLING SOLAR BLOGS MARQUEE (Span 12 cols) ── */}
          <div
            style={{
              gridColumn: 'span 12',
              background: 'var(--color-ash)',
              border: '1px solid var(--color-mist)',
              borderRadius: '20px',
              padding: '24px 20px 20px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginTop: '12px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '8px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-ember-orange)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {strings.latestInsights}
              </h3>
            </div>

            {/* Marquee Wrapper */}
            <div className="marquee-wrapper" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
              {/* Fade masks */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: '40px',
                background: 'linear-gradient(to right, var(--color-ash), transparent)',
                zIndex: 2, pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0, width: '40px',
                background: 'linear-gradient(to left, var(--color-ash), transparent)',
                zIndex: 2, pointerEvents: 'none'
              }} />

              {/* Dynamic CSS for Marquee */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-inner {
                  display: flex;
                  gap: 20px;
                  width: max-content;
                  animation: marquee 50s linear infinite;
                }
                .marquee-inner:hover {
                  animation-play-state: paused;
                }
                .blog-marquee-card {
                  width: 320px;
                  background: var(--color-canvas-white);
                  border: 1px solid var(--color-mist);
                  border-radius: 6px 0px 0px 6px;
                  padding: 18px;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  transition: all 0.2s ease;
                  cursor: pointer;
                  text-decoration: none;
                }
                .blog-marquee-card:hover {
                  border-color: var(--color-ember-orange);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                  transform: translateY(-2px);
                }
              `}} />

              {/* Inner Scrolling Content (Duplicated for seamless loop) */}
              <div className="marquee-inner">
                {/* First Copy */}
                {blogArticles.map((blog, idx) => (
                  <a
                    key={`blog-1-${idx}`}
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-marquee-card"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-brass)' }}>
                          {blog.source}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>
                          {blog.pubDate}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-graphite)', margin: '0 0 6px', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
                        {blog.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-steel)', margin: 0, lineHeight: 1.4 }}>
                        {blog.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-ember-orange)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                        Read Article <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </a>
                ))}

                {/* Second Copy for Seamless Loop */}
                {blogArticles.map((blog, idx) => (
                  <a
                    key={`blog-2-${idx}`}
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-marquee-card"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-brass)' }}>
                          {blog.source}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>
                          {blog.pubDate}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-graphite)', margin: '0 0 6px', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
                        {blog.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-steel)', margin: 0, lineHeight: 1.4 }}>
                        {blog.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-ember-orange)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                        Read Article <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
