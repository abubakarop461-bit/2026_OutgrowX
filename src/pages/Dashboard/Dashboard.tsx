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
import { TrendingUp, Zap, Sun, DollarSign, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { calculateROI } from '../../services/roiCalculator';
import { calculateSolarScore } from '../../services/solarScorer';
import { getStateGridHistory } from '../../services/roiCalculator';
import { checkSubsidyEligibility } from '../../data/govtSchemes';
import type { ROIData, SolarScore } from '../../types';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

const CountUp: React.FC<{ end: number; prefix?: string; suffix?: string; decimals?: number }> = ({ end, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let rafId: number;
    const duration = 1500;
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

const AnimatedBar: React.FC<{ value: number; label: string; delay?: number }> = ({ value, label, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100 + delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="score-bar-item mb-3">
      <div className="flex justify-between mb-1">
        <span className="score-bar-label text-sm text-secondary">{label}</span>
        <span className="score-bar-value text-sm font-medium text-primary">{value}</span>
      </div>
      <div className="score-bar-track h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="score-bar-fill h-full rounded-full"
          style={{ width: `${width}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { userProfile } = useApp();
  const { t } = useTranslation();
  const [yearSpan, setYearSpan] = useState<10 | 20 | 25>(20);
  const [insightText, setInsightText] = useState('');
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [solarScore, setSolarScore] = useState<SolarScore | null>(null);
  const [gridRate, setGridRate] = useState(8);

  const userName = userProfile.firstName || userProfile.name || 'Friend';
  const userState = userProfile.state || 'Maharashtra';
  const userDiscom = userProfile.discom || 'MSEDCL';
  const avgBill = Number(userProfile.billAmount || userProfile.avgBill || 3200);
  const roofArea = Number(userProfile.roofArea || userProfile.roofSqFt || 800);

  useEffect(() => {
    const profile = {
      state: userState,
      discom: userDiscom,
      billSize: avgBill,
      roofArea: roofArea,
      roofType: 'flat' as const
    };
    const roi = calculateROI(profile);
    setRoiData(roi);

    const score = calculateSolarScore(profile);
    setSolarScore(score);

    const history = getStateGridHistory(userState, userDiscom);
    if (history.length > 0) {
      setGridRate(history[history.length - 1].rate);
    }
  }, [userState, userDiscom, avgBill, roofArea]);

  const fullInsight = `Based on ${userDiscom}'s projected 8% annual tariff increase in ${userState}, your estimated monthly solar savings is ₹${(avgBill * 0.85).toLocaleString('en-IN')}.`;

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setInterval>;
    const startTyping = () => {
      timer = setInterval(() => {
        setInsightText(fullInsight.slice(0, i));
        i++;
        if (i > fullInsight.length) clearInterval(timer);
      }, 25);
    };
    startTyping();
    return () => clearInterval(timer);
  }, [fullInsight]);

  const monthlySavings = Math.round(avgBill * 0.85);
  const recommendedKW = roiData?.systemSizeKW || Math.max(1, Number((avgBill / 1000).toFixed(1)));
  const paybackYears = roiData?.paybackYears || 4.2;
  const subsidyAmount = roiData?.subsidy || 78000;
  const yearlyData = roiData?.yearlyData || [];

  const subsidies = checkSubsidyEligibility({ state: userState, billSize: avgBill, roofArea });

  const generateRoiData = useCallback((years: number) => {
    const labels = yearlyData.slice(0, years + 1).map(d => `Year ${d.year}`);
    const cumulative = yearlyData.slice(0, years + 1).map(d => d.cumulative);
    const savings = yearlyData.slice(0, years + 1).map(d => d.savings);

    return {
      labels,
      datasets: [
        {
          label: 'Cumulative Savings',
          data: cumulative,
          borderColor: '#A8FF3E',
          backgroundColor: 'rgba(168, 255, 62, 0.12)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Annual Savings',
          data: savings,
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          fill: false,
          tension: 0.4,
          borderDash: [5, 5],
        }
      ]
    };
  }, [yearlyData]);

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

  const solarPct = Math.min(85, Math.round((monthlySavings / avgBill) * 100));
  const gridPct = 100 - solarPct;

  const billData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Before Solar',
        data: Array.from({ length: 6 }, (_, i) => Math.round(avgBill * (0.9 + i * 0.08))),
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'After Solar',
        data: Array.from({ length: 6 }, (_, i) => Math.round(avgBill * 0.15 * (0.9 + i * 0.08))),
        backgroundColor: 'rgba(168, 255, 62, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const billOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8BAF95' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8BAF95' } }
    }
  };

  const pieData = {
    labels: ['Solar', 'Grid'],
    datasets: [{
      data: [solarPct, gridPct],
      backgroundColor: ['#A8FF3E', '#1F3324'],
      borderWidth: 0,
    }]
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '70%',
  };

  return (
    <main className="page p-6">
      <div className="container" style={{ maxWidth: '1280px' }}>
        <div className="flex-col gap-6">

          {/* 1. Welcome Hero */}
          <header className="flex flex-row justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Good morning, {userName} ☀️
              </h1>
              <p className="text-secondary text-lg">
                Solar Intelligence for {userState} · DISCOM: {userDiscom}
              </p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="flex items-center justify-end text-sm text-secondary mb-1">
                <Calendar size={16} className="mr-2" />
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-sm text-accent max-w-sm ml-auto">
                ✦ Model insights updated just now
              </div>
            </div>
          </header>

          {/* 2. KPI Strip */}
          <div className="grid-4 gap-4">
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-2">
                <span className="stat-label text-sm text-secondary">{t('monthlySavings') || 'Monthly Savings'}</span>
                <div className="badge badge--green">
                  <TrendingUp size={12} className="mr-1" /> +12%
                </div>
              </div>
              <div className="stat-value stat-value--accent text-3xl font-bold">
                <CountUp end={monthlySavings} prefix="₹" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-2">
                <span className="stat-label text-sm text-secondary">{t('paybackPeriod') || 'Payback Period'}</span>
                <DollarSign size={16} className="text-secondary" />
              </div>
              <div className="stat-value text-3xl font-bold text-primary">
                <CountUp end={paybackYears} decimals={1} suffix=" years" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-2">
                <span className="stat-label text-sm text-secondary">System Size</span>
                <div className="badge badge--muted">Recommended</div>
              </div>
              <div className="stat-value text-3xl font-bold text-primary">
                {recommendedKW} <span className="text-xl text-secondary">kW</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-2">
                <span className="stat-label text-sm text-secondary">Subsidy Eligible</span>
                <CheckCircle2 size={16} className="text-amber" />
              </div>
              <div className="stat-value stat-value--amber text-3xl font-bold">
                <CountUp end={subsidyAmount} prefix="₹" />
              </div>
            </div>
          </div>

          {/* Middle Section: ROI Chart & Score Card */}
          <div className="grid-3 gap-6">
            {/* 3. ROI Comparison Chart */}
            <div className="glass-card p-6 rounded-2xl col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">ROI & Lifecycle Savings</h2>
                  <p className="text-sm text-secondary">Projected cumulative savings over {yearSpan} years</p>
                </div>
                <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--bg-base)' }}>
                  {[10, 20, 25].map((span) => (
                    <button
                      key={span}
                      onClick={() => setYearSpan(span as 10 | 20 | 25)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${yearSpan === span ? 'text-accent' : 'text-secondary'}`}
                      style={{ background: yearSpan === span ? 'var(--bg-elevated)' : 'transparent' }}
                    >
                      {span}yr
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-container chart-container--lg">
                <Line data={generateRoiData(yearSpan)} options={roiChartOptions} />
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(168,255,62,0.5)', border: '1px solid var(--accent-primary)' }}></div>
                  Cumulative Savings
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(34,197,94,0.5)', border: '1px solid var(--accent-green)' }}></div>
                  Annual Savings
                </div>
              </div>
            </div>

            {/* 6. Solar Score Card */}
            <div className="glass-card p-6 rounded-2xl flex-col">
              <h2 className="text-xl font-semibold mb-6">{t('solarScore') || 'Solar Suitability Score'}</h2>
              <div className="flex items-end gap-3 mb-8">
                <span className="stat-value stat-value--accent" style={{ fontSize: '3.5rem' }}>
                  <CountUp end={solarScore?.overall || 85} />
                </span>
                <span className="text-2xl text-secondary mb-2">/ 100</span>
              </div>
              <div className="score-bar-list flex-1 gap-4">
                <AnimatedBar value={solarScore?.solarResource || 80} label="Solar Resource" delay={0} />
                <AnimatedBar value={solarScore?.energyFit || 85} label="Energy Fit" delay={100} />
                <AnimatedBar value={solarScore?.roofSuitability || 75} label="Roof Suitability" delay={200} />
                <AnimatedBar value={solarScore?.financialROI || 82} label="Financial ROI" delay={300} />
                <AnimatedBar value={solarScore?.governmentSupport || 78} label="Govt. Support" delay={400} />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid-4 gap-6">
            {/* 4. Monthly Bill Comparison */}
            <div className="glass-card p-6 rounded-2xl col-span-2">
              <h2 className="text-xl font-semibold mb-6">Monthly Bill Impact</h2>
              <div className="chart-container chart-container--sm">
                <Bar data={billData} options={billOptions} />
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(249,115,22,0.7)' }}></div> Before Solar
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(168,255,62,0.8)' }}></div> After Solar
                </div>
              </div>
            </div>

            {/* 5. Energy Source */}
            <div className="glass-card p-6 rounded-2xl relative">
              <h2 className="text-xl font-semibold mb-6">Energy Source</h2>
              <div className="relative" style={{ height: '160px' }}>
                <Pie data={pieData} options={pieOptions} />
                <div className="absolute inset-0 flex-col items-center justify-center pointer-events-none flex">
                  <span className="text-2xl font-bold text-accent">{solarPct}%</span>
                  <span className="text-xs text-secondary">Solar</span>
                </div>
              </div>
            </div>

            {/* 7. Electricity Rate Card */}
            <div className="glass-card p-6 rounded-2xl flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Grid Rate</h2>
                  <Zap size={20} style={{ color: '#F97316' }} />
                </div>
                <div className="text-3xl font-bold mb-1">
                  ₹{gridRate.toFixed(2)}<span className="text-sm text-secondary font-normal">/kWh</span>
                </div>
                <div className="text-sm text-secondary mb-4">{userState} ({userDiscom})</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: '#F97316' }}>
                  <TrendingUp size={14} /> +7.2% per year avg
                </div>
                <div className="flex items-end gap-1 h-8 opacity-70">
                  {[30, 40, 50, 65, 80, 100].map((h, i) => (
                    <div key={i} className="w-full rounded-t-sm" style={{ height: `${h}%`, background: 'rgba(249,115,22,0.5)' }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 8 & 9. Subsidies and AI Insights */}
          <div className="grid-2 gap-6 pb-12">
            {/* 8. Govt Subsidy Card */}
            <div className="glass-card p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(245,158,11,0.06) 100%)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Sun size={20} className="text-amber" />
                <h2 className="text-xl font-semibold">Government Subsidies</h2>
              </div>
              <div className="flex-col gap-4 mb-6">
                {subsidies.length > 0 ? subsidies.map((scheme, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div className="font-medium">{scheme.name}</div>
                      <div className="text-xs text-secondary">{scheme.type} Scheme</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber">{scheme.subsidyAmount}</span>
                      <CheckCircle2 size={16} className="text-green" />
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-between p-3 rounded-lg opacity-50" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div className="font-medium">PM Surya Ghar</div>
                      <div className="text-xs text-secondary">Residential rooftops</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber">₹78,000 eligible</span>
                      <CheckCircle2 size={16} className="text-green" />
                    </div>
                  </div>
                )}
              </div>
              <button className="btn btn-primary w-full justify-center" style={{ background: 'var(--accent-amber)', color: '#000' }}>
                Check Eligibility Details
              </button>
            </div>

            {/* 9. AI Insight Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden" style={{ borderColor: 'rgba(168,255,62,0.2)' }}>
              <div
                className="absolute pointer-events-none"
                aria-hidden="true"
                style={{
                  top: 0, right: 0, width: '128px', height: '128px',
                  background: 'rgba(168,255,62,0.1)', filter: 'blur(48px)',
                  borderRadius: '50%', transform: 'translate(50%, -50%)'
                }}
              ></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-accent" />
                  <h2 className="text-xl font-semibold text-accent">Today's Solar Insight</h2>
                </div>
                <span className="model-badge text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(168,255,62,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(168,255,62,0.2)' }}>
                  Solar Pro AI ✦
                </span>
              </div>
              <p className="text-lg leading-relaxed relative z-10 min-h-24">
                {insightText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
