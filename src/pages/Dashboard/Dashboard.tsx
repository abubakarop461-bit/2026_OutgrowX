import React, { useState, useEffect, useRef } from 'react';
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
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Zap, Sun, Battery, DollarSign, CheckCircle2, AlertCircle, Calendar, Sparkles } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const CountUp: React.FC<{ end: number; prefix?: string; suffix?: string; decimals?: number }> = ({ end, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
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
        <span className="score-bar-label text-sm text-text-secondary">{label}</span>
        <span className="score-bar-value text-sm font-medium text-text-primary">{value}</span>
      </div>
      <div className="score-bar-track h-2 bg-surface rounded-full overflow-hidden">
        <div 
          className="score-bar-fill h-full bg-accent transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

import { useApp } from '../../context/AppContext';

const Dashboard: React.FC = () => {
  const { userProfile } = useApp();
  const [yearSpan, setYearSpan] = useState<10 | 20 | 25>(20);
  const [insightText, setInsightText] = useState('');
  
  const userName = userProfile.firstName || userProfile.name || 'Friend';
  const userState = userProfile.state || 'Maharashtra';
  const userDiscom = userProfile.discom || 'MSEDCL';
  const avgBill = Number(userProfile.avgBill || userProfile.billAmount || 3200);
  const monthlySavings = Math.round(avgBill * 0.85);
  const recommendedKW = Math.max(1, Number((avgBill / 1000).toFixed(1)));
  const paybackYears = Math.min(6.5, Math.max(3.0, Number((4.2 * (3200 / (avgBill || 3200))).toFixed(1))));
  const subsidyAmount = recommendedKW <= 2 ? 30000 * recommendedKW : recommendedKW <= 3 ? 60000 + 18000 * (recommendedKW - 2) : 78000;

  const fullInsight = `Based on ${userDiscom}'s projected 8% annual tariff increase in ${userState}, your estimated monthly solar savings is ₹${monthlySavings.toLocaleString('en-IN')}.`;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setInsightText(fullInsight.slice(0, i));
      i++;
      if (i > fullInsight.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [fullInsight]);


  // --- Chart Data ---
  
  // ROI Line Chart Data
  const generateRoiData = (years: number) => {
    const labels = Array.from({ length: years + 1 }, (_, i) => (2005 + i).toString());
    const gridCost = Array.from({ length: years + 1 }, (_, i) => Math.pow(1.08, i) * 50000); // Exponential rising cost
    const solarSavings = Array.from({ length: years + 1 }, (_, i) => {
        if (i < 5) return 0; // Solar installed in 2010 (index 5)
        return (i - 4) * 45000; // Linear savings after install
    });

    return {
      labels,
      datasets: [
        {
          label: 'Grid Electricity Cost',
          data: gridCost,
          borderColor: '#F97316',
          backgroundColor: 'rgba(249, 115, 22, 0.15)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Solar Savings',
          data: solarSavings,
          borderColor: '#A8FF3E',
          backgroundColor: 'rgba(168, 255, 62, 0.12)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
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

  // Monthly Bill Bar Chart
  const billData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Before Solar',
        data: [4200, 4500, 5100, 6200, 6800, 7100],
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'After Solar',
        data: [800, 950, 850, 1200, 1400, 1500],
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

  // Energy Source Pie Chart
  const pieData = {
    labels: ['Solar', 'Grid'],
    datasets: [{
      data: [72, 28],
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
    <div className="min-h-screen bg-base p-6 text-text-primary font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Welcome Hero */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-surface">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold mb-2">
              Good morning, {userName} ☀️
            </h1>
            <p className="text-text-secondary text-lg">
              Solar Intelligence for {userState} · DISCOM: {userDiscom}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="flex items-center justify-end text-sm text-text-secondary mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-sm text-accent max-w-sm ml-auto">
              ✦ Model insights updated just now
            </div>
          </div>
        </header>

        {/* 2. KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl bg-surface border border-white/5">
            <div className="flex items-start justify-between mb-2">
              <span className="stat-label text-text-secondary text-sm">Monthly Savings</span>
              <div className="badge badge--green bg-green-500/10 text-green-400 px-2 py-1 rounded-md text-xs flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </div>
            </div>
            <div className="stat-value stat-value--accent text-3xl font-bold text-accent">
              <CountUp end={monthlySavings} prefix="₹" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl bg-surface border border-white/5">
            <div className="flex items-start justify-between mb-2">
              <span className="stat-label text-text-secondary text-sm">Payback Period</span>
              <DollarSign className="w-4 h-4 text-text-secondary" />
            </div>
            <div className="stat-value text-3xl font-bold text-text-primary">
              <CountUp end={paybackYears} decimals={1} suffix=" years" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl bg-surface border border-white/5">
            <div className="flex items-start justify-between mb-2">
              <span className="stat-label text-text-secondary text-sm">System Size</span>
              <div className="badge bg-white/10 text-white px-2 py-1 rounded-md text-xs">Recommended</div>
            </div>
            <div className="stat-value text-3xl font-bold text-text-primary">
              {recommendedKW} <span className="text-xl text-text-secondary">kW</span>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl bg-surface border border-white/5">
            <div className="flex items-start justify-between mb-2">
              <span className="stat-label text-text-secondary text-sm">Subsidy Eligible</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="stat-value stat-value--amber text-3xl font-bold text-amber-400">
              <CountUp end={subsidyAmount} prefix="₹" />
            </div>
          </div>
        </div>

        {/* Middle Section: ROI Chart & Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. ROI Comparison Chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl bg-surface border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">ROI & Lifecycle Savings</h2>
                <p className="text-sm text-text-secondary">If you had gone solar in 2010, your cumulative savings today would be ₹3.8 Lakh</p>
              </div>
              <div className="flex gap-2 bg-base p-1 rounded-lg">
                {[10, 20, 25].map((span) => (
                  <button
                    key={span}
                    onClick={() => setYearSpan(span as 10|20|25)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${yearSpan === span ? 'bg-surface text-accent' : 'text-text-secondary hover:text-white'}`}
                  >
                    {span}yr
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <Line data={generateRoiData(yearSpan)} options={roiChartOptions} />
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-orange-500/50 border border-orange-500"></div> Grid Cost</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-accent/50 border border-accent"></div> Solar Savings</div>
            </div>
          </div>

          {/* 6. Solar Score Card */}
          <div className="glass-card p-6 rounded-2xl bg-surface border border-white/5 flex flex-col">
            <h2 className="text-xl font-semibold mb-6">Solar Suitability Score</h2>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-display font-bold text-accent"><CountUp end={89} /></span>
              <span className="text-2xl text-text-secondary mb-2">/ 100</span>
            </div>
            <div className="score-bar-list flex-1 space-y-4">
              <AnimatedBar value={94} label="Solar Resource" delay={0} />
              <AnimatedBar value={91} label="Energy Fit" delay={100} />
              <AnimatedBar value={85} label="Roof Suitability" delay={200} />
              <AnimatedBar value={92} label="Financial ROI" delay={300} />
              <AnimatedBar value={87} label="Govt. Support" delay={400} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 4. Monthly Bill Comparison */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl bg-surface border border-white/5">
             <h2 className="text-xl font-semibold mb-6">Monthly Bill Impact</h2>
             <div className="h-[200px]">
               <Bar data={billData} options={billOptions} />
             </div>
             <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-orange-500"></div> Before Solar</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-accent"></div> After Solar</div>
            </div>
          </div>

          {/* 5. Energy Source */}
          <div className="glass-card p-6 rounded-2xl bg-surface border border-white/5 relative">
            <h2 className="text-xl font-semibold mb-6">Energy Source</h2>
            <div className="h-[160px] relative">
              <Pie data={pieData} options={pieOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-accent">72%</span>
                <span className="text-xs text-text-secondary">Solar</span>
              </div>
            </div>
          </div>

          {/* 7. Electricity Rate Card */}
          <div className="glass-card p-6 rounded-2xl bg-surface border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Grid Rate</h2>
                <Zap className="text-orange-400 w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-1">₹9.80<span className="text-sm text-text-secondary font-normal">/kWh</span></div>
              <div className="text-sm text-text-secondary mb-4">Maharashtra (MSEDCL)</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm text-orange-400 mb-2">
                <TrendingUp size={14} /> +7.2% per year avg
              </div>
              <div className="flex items-end gap-1 h-8 opacity-70">
                {[30, 40, 50, 65, 80, 100].map((h, i) => (
                  <div key={i} className="bg-orange-500/50 w-full rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 8 & 9. Subsidies and AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          
          {/* 8. Govt Subsidy Card */}
          <div className="glass-card p-6 rounded-2xl bg-surface border border-white/5 bg-gradient-to-br from-surface to-amber-900/10">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="text-amber-400 w-5 h-5" />
              <h2 className="text-xl font-semibold">Government Subsidies</h2>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between bg-base/50 p-3 rounded-lg border border-white/5">
                <div>
                  <div className="font-medium">PM Surya Ghar</div>
                  <div className="text-xs text-text-secondary">Residential rooftops</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">₹78,000 eligible</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
              </div>
              <div className="flex items-center justify-between bg-base/50 p-3 rounded-lg border border-white/5 opacity-50">
                <div>
                  <div className="font-medium">PM-KUSUM</div>
                  <div className="text-xs text-text-secondary">Agriculture & Farmers</div>
                </div>
                <div className="text-xs text-text-secondary">Not applicable</div>
              </div>
            </div>
            <button className="btn btn-primary w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-colors">
              Check Eligibility Details
            </button>
          </div>

          {/* 9. AI Insight Card */}
          <div className="glass-card p-6 rounded-2xl bg-surface border border-accent/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="text-accent w-5 h-5" />
                <h2 className="text-xl font-semibold text-accent">Today's Solar Insight</h2>
              </div>
              <span className="model-badge text-xs font-medium bg-accent/10 text-accent px-2 py-1 rounded-full border border-accent/20">
                Solar Pro AI ✦
              </span>
            </div>
            <p className="text-lg leading-relaxed relative z-10 min-h-[100px]">
              {insightText}
              <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle"></span>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
