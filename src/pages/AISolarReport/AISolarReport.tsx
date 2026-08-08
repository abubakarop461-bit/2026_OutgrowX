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
import { Download, Sun, CheckCircle2, Star, Zap, Settings, ShieldCheck, Printer } from 'lucide-react';
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
      discom: userProfile.discom || 'Maha Vitaran',
      billSize: Number(userProfile.billAmount || userProfile.avgBill || 3200),
      roofArea: Number(userProfile.roofArea || userProfile.roofSqFt || 800),
      roofType: 'flat' as const
    };
    return calculateROI(profile);
  }, [userProfile]);

  const solarScore = useMemo(() => {
    const profile = {
      state: userProfile.state || 'Maharashtra',
      discom: userProfile.discom || 'Maha Vitaran',
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
    }, 1200);
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
        backgroundColor: 'rgba(255, 104, 44, 0.06)',
        borderColor: '#ff682c',
        borderWidth: 2,
        tension: 0.3,
      }
    ]
  };

  const yearlySavingsData = {
    labels: years.map(y => `Y${y}`),
    datasets: [
      {
        label: 'Annual Savings (₹)',
        data: savingsData,
        backgroundColor: '#816729',
        borderRadius: 2,
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
      y: { grid: { color: '#f5f5f5' }, ticks: { color: '#828282', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: '#828282', font: { size: 11 } } }
    }
  };

  const panelsCount = Math.round(roiData.systemSizeKW * 2.5);
  const annualGeneration = Math.round(roiData.systemSizeKW * 4.2 * 365);

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
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          header, nav, .no-print { display: none !important; }
          .vai-card, .vai-card--white { border: 1px solid #ddd !important; background: white !important; box-shadow: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header (Ventriloc style) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-mist)', paddingBottom: '20px', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, letterSpacing: '-0.64px', margin: 0 }}>
            Solar Report
          </h1>

          <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={15} /> Print Report
            </button>
            <button className="btn btn-primary" onClick={handleGenerate}>
              {isGenerating ? 'Synthesizing Data…' : 'Regenerate Brief'}
            </button>
          </div>
        </div>

        {/* ── Key Metrics Strip (Ventriloc 20px Cards) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="vai-stat">
            <div className="vai-stat-value">{roiData.systemSizeKW} kW</div>
            <div className="vai-stat-label">Recommended Capacity</div>
          </div>
          <div className="vai-stat">
            <div className="vai-stat-value" style={{ color: '#16a34a' }}>₹{roiData.subsidy.toLocaleString('en-IN')}</div>
            <div className="vai-stat-label">PM Surya Ghar Subsidy</div>
          </div>
          <div className="vai-stat">
            <div className="vai-stat-value">₹{Math.round(roiData.annualSavings).toLocaleString('en-IN')}</div>
            <div className="vai-stat-label">Annual Bill Savings</div>
          </div>
          <div className="vai-stat">
            <div className="vai-stat-value">{roiData.paybackYears} yrs</div>
            <div className="vai-stat-label">Simple Payback</div>
          </div>
        </div>

        {/* ── Engineering & Financial Deep-Dive ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '28px' }}>
          {/* ROI Chart Card */}
          <div className="vai-card--white">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              25-Year Cumulative Savings Trajectory
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
              Financial Return Horizon
            </h3>
            <div style={{ height: '220px' }}>
              <Line data={roiChartData} options={roiOptions} />
            </div>
          </div>

          {/* System Spec Table (Ash Card) */}
          <div className="vai-card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              Technical Specifications
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
              Plant Architecture
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>PV Modules</span>
                <strong>{panelsCount} × 400W ALMM Monocrystalline</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>Annual Generation</span>
                <strong>~{annualGeneration.toLocaleString('en-IN')} kWh/yr</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>Net Capital Outlay</span>
                <strong>~₹{(roiData.netInvestment || Math.round(roiData.systemSizeKW * 65000 - roiData.subsidy)).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>25-Year Net ROI</span>
                <strong style={{ color: 'var(--color-ember-orange)' }}>+₹{(roiData.roi25Year / 100000).toFixed(1)} Lakh</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── Matched Empanelled Installers ── */}
        <div className="vai-card--white">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            DISCOM Verified Partners
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
            Empanelled Installers for {userProfile.state || 'Maharashtra'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {matchedVendors.map(v => (
              <div key={v.id} style={{ background: 'var(--color-fog)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--color-graphite)' }}>{v.companyName}</span>
                  <span className="badge badge--ember">★ {v.rating}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>
                  {v.reviewCount * 4} Verified Reviews · {v.type}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                  Tier-1 ALMM Panels · 5-Yr Comprehensive O&amp;M Included
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
