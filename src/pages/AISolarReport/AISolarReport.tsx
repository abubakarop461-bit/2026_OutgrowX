import React, { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Download, Sun, CheckCircle2, Star, Zap, Settings, ShieldCheck, Battery } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { calculateROI } from '../../services/roiCalculator';
import { calculateSolarScore } from '../../services/solarScorer';
import { VENDORS } from '../../data/vendors';
import { checkSubsidyEligibility } from '../../data/govtSchemes';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

export default function AISolarReport() {
  const { userProfile } = useApp();
  const { t } = useTranslation();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const roiData = useMemo(() => {
    const profile = {
      state: userProfile.state || 'Maharashtra',
      discom: userProfile.discom || 'MSEDCL',
      billSize: Number(userProfile.billAmount || userProfile.avgBill || 3200),
      roofArea: Number(userProfile.roofArea || userProfile.roofSqFt || 800),
      roofType: 'flat' as const
    };
    return calculateROI(profile);
  }, [userProfile]);

  const solarScore = useMemo(() => {
    const profile = {
      state: userProfile.state || 'Maharashtra',
      discom: userProfile.discom || 'MSEDCL',
      billSize: Number(userProfile.billAmount || userProfile.avgBill || 3200),
      roofArea: Number(userProfile.roofArea || userProfile.roofSqFt || 800),
      roofType: 'flat' as const
    };
    return calculateSolarScore(profile);
  }, [userProfile]);

  const subsidies = useMemo(() => checkSubsidyEligibility({
    state: userProfile.state || 'Maharashtra',
    billSize: Number(userProfile.billAmount || userProfile.avgBill || 3200),
    roofArea: Number(userProfile.roofArea || userProfile.roofSqFt || 800)
  }), [userProfile]);

  const matchedVendors = useMemo(() => {
    return VENDORS.filter(v => v.states.includes(userProfile.state || 'Maharashtra')).slice(0, 3);
  }, [userProfile.state]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const handlePrint = () => window.print();

  const years = roiData.yearlyData.map(d => d.year);
  const cumulativeData = roiData.yearlyData.map(d => d.cumulative);
  const savingsData = roiData.yearlyData.map(d => d.savings);

  const roiChartData = {
    labels: years,
    datasets: [
      {
        label: 'Cumulative Savings (₹)',
        data: cumulativeData,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(168, 255, 62, 0.4)');
          gradient.addColorStop(1, 'rgba(168, 255, 62, 0.05)');
          return gradient;
        },
        borderColor: '#A8FF3E',
        tension: 0.4,
      }
    ]
  };

  const yearlySavingsData = {
    labels: years.map(y => `Y${y}`),
    datasets: [
      {
        label: 'Annual Savings (₹)',
        data: savingsData,
        backgroundColor: '#4ADE80',
        borderRadius: 4,
      }
    ]
  };

  const roiOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `₹${context.raw.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        }
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#8BAF95' } },
      x: { grid: { display: false }, ticks: { color: '#8BAF95' } }
    }
  };

  const panelsCount = Math.round(roiData.systemSizeKW * 2.5);
  const annualGeneration = Math.round(roiData.systemSizeKW * 4 * 365);

  return (
    <main className="container mx-auto px-4 pb-12" style={{ paddingTop: '16px' }}>
      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, .no-print { display: none !important; }
          .glass-card { background: white !important; border: 1px solid #ccc !important; box-shadow: none !important; color: black !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="model-badge px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: 'rgba(168,255,62,0.2)', color: 'var(--accent-primary)', border: '1px solid rgba(168,255,62,0.3)' }}>
              <Sun size={14} /> Solar Intelligence ✦
            </span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-1">{t('aiReportTitle')}</h1>
          <p className="text-gray-400">{t('aiReportDesc')} ({userProfile.firstName || 'User'} · {userProfile.state || 'Maharashtra'})</p>
        </div>
        <div className="flex gap-3 no-print">
          {!isGenerated && (
            <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Analyzing Data...' : t('generateReport') || 'Generate Report'}
            </button>
          )}
          {isGenerated && (
            <button className="btn btn-secondary flex items-center gap-2" onClick={handlePrint}>
              <Download size={18} /> Export PDF
            </button>
          )}
        </div>
      </div>

      {!isGenerated ? (
        isGenerating ? (
          <div className="flex-col gap-6">
            <div className="skeleton h-32 rounded-xl"></div>
            <div className="skeleton h-96 rounded-xl"></div>
            <div className="grid-2 gap-6">
              <div className="skeleton h-64 rounded-xl"></div>
              <div className="skeleton h-64 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center" style={{ border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)', minHeight: '384px' }}>
            <Sun className="text-accent mb-4" size={48} />
            <h2 className="text-2xl font-semibold mb-2">Ready to discover your solar potential?</h2>
            <p className="text-gray-400 max-w-md mb-6">Our AI will analyze your roof size, location, and energy profile to generate a customized 25-year projection.</p>
            <button className="btn btn-primary btn-lg" onClick={handleGenerate}>Generate Report Now</button>
          </div>
        )
      ) : (
        <div className="flex-col gap-8 space-y-8">

          {/* Section 1 - Exec Summary */}
          <section className="grid-4 gap-4">
            <div className="glass-card p-5 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-1">Recommended System</p>
              <p className="text-2xl font-bold text-accent">{roiData.systemSizeKW} kW</p>
            </div>
            <div className="glass-card p-5 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-1">Annual Savings</p>
              <p className="text-2xl font-bold text-accent">₹{roiData.annualSavings.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-card p-5 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-1">Payback Period</p>
              <p className="text-2xl font-bold text-accent">{roiData.paybackYears} years</p>
            </div>
            <div className="glass-card p-5 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, rgba(168,255,62,0.1) 0%, transparent 100%)', borderColor: 'rgba(168,255,62,0.3)' }}>
              <p className="text-sm text-gray-400 mb-1">Solar Score</p>
              <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                {solarScore.overall}/100 <Zap size={20} />
              </p>
            </div>
          </section>

          {/* Section 2 & 3 Charts */}
          <section className="grid-2 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">25-Year ROI Projection</h3>
              <div className="chart-container" style={{ height: '256px', marginBottom: '16px' }}>
                <Line data={roiChartData} options={roiOptions} />
              </div>
              <p className="text-center text-sm text-gray-400">
                <strong className="text-primary">₹{(roiData.roi25Year / 100 * roiData.netInvestment / 100000).toFixed(1)}L</strong> total savings over 25 years · <strong className="text-primary">₹{(roiData.annualSavings / 100000).toFixed(1)}L</strong> annual average
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Yearly Savings Breakdown</h3>
              <div className="chart-container" style={{ height: '256px', marginBottom: '16px' }}>
                <Bar data={yearlySavingsData} options={roiOptions} />
              </div>
              <p className="text-center text-sm text-gray-400">
                Accounts for 5% annual grid tariff escalation
              </p>
            </div>
          </section>

          {/* Section 4 - System Config */}
          <section className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="text-accent" /> System Configuration
            </h3>
            <div className="grid-4 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <Sun className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Solar Panels</p>
                <p className="font-medium">{panelsCount} × 400W Monocrystalline (Tier 1)</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <Zap className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Inverter</p>
                <p className="font-medium">{roiData.systemSizeKW} kW String Inverter</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <Settings className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Mounting</p>
                <p className="font-medium">Rooftop fixed tilt</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <Battery className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Battery (Optional)</p>
                <p className="font-medium">5 kWh LFP</p>
              </div>
            </div>
            <p className="mt-4 text-center font-medium text-accent">Estimated Annual Generation: {annualGeneration.toLocaleString('en-IN')} kWh</p>
          </section>

          {/* Section 6 - Gov Schemes */}
          <section className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-accent" /> Government Schemes & Subsidies
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th className="py-3 px-4 font-semibold">Scheme</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Estimated Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {subsidies.length > 0 ? subsidies.map((scheme, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-3 px-4">{scheme.name}</td>
                      <td className="py-3 px-4 text-accent flex items-center gap-1"><CheckCircle2 size={16} /> {scheme.type}</td>
                      <td className="py-3 px-4 font-medium">{scheme.subsidyAmount}</td>
                    </tr>
                  )) : (
                    <>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-3 px-4">PM Surya Ghar: Muft Bijli Yojana</td>
                        <td className="py-3 px-4 text-accent flex items-center gap-1"><CheckCircle2 size={16} /> Central</td>
                        <td className="py-3 px-4 font-medium">₹78,000 subsidy</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-3 px-4">DISCOM Net Metering</td>
                        <td className="py-3 px-4 text-accent flex items-center gap-1"><CheckCircle2 size={16} /> State</td>
                        <td className="py-3 px-4 font-medium">Export credits</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7 - Vendors */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Top Vendor Matches</h3>
            <div className="grid-3 gap-4">
              {matchedVendors.map((vendor) => (
                <div key={vendor.id} className="vendor-card glass-card p-5 rounded-xl transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                      <span className="text-xl">{vendor.logo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)' }}>
                      <Star size={14} className="text-yellow-400 fill-yellow-400" /> {vendor.rating}
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{vendor.companyName}</h4>
                  <p className="text-sm text-gray-400 mb-4">{vendor.type} · {vendor.reviewCount} reviews</p>
                  <button className="btn btn-secondary w-full">{t('getQuote') || 'Get Quote'}</button>
                </div>
              ))}
              {matchedVendors.length === 0 && (
                <div className="glass-card p-5 rounded-xl text-center text-gray-400 col-span-3">
                  No vendors found for your state. Showing nearest options.
                </div>
              )}
            </div>
          </section>

          {/* Section 8 - Next Steps */}
          <section className="glass-card p-6 rounded-2xl" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
            <div className="flex-col gap-3">
              {[
                'Book a free site survey with matched vendors',
                'Apply for PM Surya Ghar subsidy online',
                'Compare quotes and finalize installation',
                'Submit DISCOM net-metering application',
                'Schedule installation and go green!'
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(168,255,62,0.2)', color: 'var(--accent-primary)' }}>
                    {idx + 1}
                  </span>
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
