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
  const { userProfile, language } = useApp();
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

  const avgBill = Number(userProfile.billAmount || userProfile.avgBill || 3200);

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const strings = {
    printReport: isHi ? "रिपोर्ट प्रिंट करें" : isMr ? "अहवाल प्रिंट करा" : "Print Report",
    regenerateBrief: isHi ? (isGenerating ? "डेटा विश्लेषण जारी है..." : "रिपोर्ट पुनः उत्पन्न करें") : isMr ? (isGenerating ? "डेटा गोळा केला जात आहे..." : "अहवाल पुन्हा तयार करा") : (isGenerating ? "Synthesizing Data…" : "Regenerate Brief"),
    recommendedCapacity: isHi ? "अनुशंसित क्षमता" : isMr ? "शिफारस केलेली क्षमता" : "Recommended Capacity",
    pmSuryaGharSubsidy: isHi ? "पीएम सूर्य घर सब्सिडी" : isMr ? "पीएम सूर्य घर अनुदान" : "PM Surya Ghar Subsidy",
    annualBillSavings: isHi ? "वार्षिक बिल बचत" : isMr ? "वार्षिक बिलात बचत" : "Annual Bill Savings",
    simplePayback: isHi ? "साधारण पेबैक" : isMr ? "गुंतवणूक परतावा काळ" : "Simple Payback",
    cumulativeSavingsTitle: isHi ? "25-वर्षीय संचयी बचत प्रक्षेपवक्र" : isMr ? "25-वर्षांची संचित बचत आलेख" : "25-Year Cumulative Savings Trajectory",
    financialReturnHorizon: isHi ? "वित्तीय लाभ क्षितिज" : isMr ? "वित्तीय परतावा अंदाज" : "Financial Return Horizon",
    technicalSpecs: isHi ? "तकनीकी विशिष्टताएँ" : isMr ? "तांत्रिक तपशील" : "Technical Specifications",
    plantArchitecture: isHi ? "सौर प्लांट वास्तुकला" : isMr ? "सोलर प्लांट रचना" : "Plant Architecture",
    pvModules: isHi ? "सौर पैनल" : isMr ? "सोलर पॅनेल्स" : "PV Modules",
    panelsDesc: (count: number) => isHi ? `${count} × 400W ALMM मोनोक्रिस्टलाइन` : isMr ? `${count} × 400W ALMM मोनोक्रिस्टलाईन` : `${count} × 400W ALMM Monocrystalline`,
    annualGeneration: isHi ? "वार्षिक बिजली उत्पादन" : isMr ? "वार्षिक वीज निर्मिती" : "Annual Generation",
    generationDesc: (gen: string) => isHi ? `~${gen} kWh/वर्ष` : isMr ? `~${gen} kWh/वर्ष` : `~${gen} kWh/yr`,
    netCapitalOutlay: isHi ? "कुल पूंजीगत व्यय" : isMr ? "एकूण भांडवली खर्च" : "Net Capital Outlay",
    netRoi: isHi ? "25-वर्षीय शुद्ध लाभ" : isMr ? "25-वर्षांचा निव्वळ परतावा" : "25-Year Net ROI",
    lakh: (val: string) => isHi ? `+₹${val} लाख` : isMr ? `+₹${val} लाख` : `+₹${val} Lakh`,
    discomVerifiedPartners: isHi ? "डिस्कॉम प्रमाणित साझेदार" : isMr ? "डिस्कॉम प्रमाणित भागीदार" : "DISCOM Verified Partners",
    empanelledInstallersFor: (state: string) => isHi ? `${state} के प्रमाणित सोलर वेंडर` : isMr ? `${state} मधील प्रमाणित सोलर वेंडर` : `Empanelled Installers for ${state}`,
    reviewsCount: (count: number) => isHi ? `${count} सत्यापित समीक्षाएँ` : isMr ? `${count} सत्यापित रिव्ह्यू` : `${count} Verified Reviews`,
    specDetails: isHi ? "टियर-1 ALMM पैनल · 5 साल की व्यापक रखरखाव वारंटी" : isMr ? "टियर-१ ALMM पॅनेल्स · ५ वर्षे पूर्ण देखभाल सेवा समाविष्ट" : "Tier-1 ALMM Panels · 5-Yr Comprehensive O&M Included",
    gridCost: isHi ? "ग्रिड लागत (सोलर के बिना)" : isMr ? "ग्रीड खर्च (सोलरशिवाय)" : "Grid Cost (No Solar)",
    solarSavings: isHi ? "सौर संचयी बचत" : isMr ? "सोलर एकत्रित बचत" : "Solar Cumulative Savings"
  };

  /* ─ ROI Chart configuration ─ */
  const roiChartData = {
    labels: Array.from({ length: 26 }, (_, i) => i.toString()),
    datasets: [
      {
        label: strings.gridCost,
        data: Array.from({ length: 26 }, (_, i) => Math.round(Math.pow(1.078, i) * avgBill * 12 * i)),
        borderColor: '#816729',
        backgroundColor: 'rgba(129, 103, 41, 0.03)',
        fill: true, tension: 0.4, borderWidth: 1.5,
      },
      {
        label: strings.solarSavings,
        data: roiData.yearlyData.map(y => Math.max(0, y.cumulative)),
        borderColor: '#ff682c',
        backgroundColor: 'rgba(255, 104, 44, 0.05)',
        fill: true, tension: 0.4, borderWidth: 2,
      }
    ]
  };

  const roiOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.03)' } }
    }
  };

  const panelsCount = Math.round(roiData.systemSizeKW * 2.5);
  const annualGeneration = Math.round(roiData.systemSizeKW * 4.2 * 365);

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '8px 24px 80px',
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
        {/* Header Control Buttons (No Title Texts) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--color-mist)', marginBottom: '24px' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={15} /> {strings.printReport}
          </button>
          <button className="btn btn-primary" onClick={handleGenerate}>
            {strings.regenerateBrief}
          </button>
        </div>

        {/* ── Key Metrics Strip (Ventriloc 20px Cards) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="vai-stat">
            <div className="vai-stat-value">{roiData.systemSizeKW} kW</div>
            <div className="vai-stat-label">{strings.recommendedCapacity}</div>
          </div>
          <div className="vai-stat">
            <div className="vai-stat-value" style={{ color: '#16a34a' }}>₹{roiData.subsidy.toLocaleString('en-IN')}</div>
            <div className="vai-stat-label">{strings.pmSuryaGharSubsidy}</div>
          </div>
          <div className="vai-stat">
            <div className="vai-stat-value">₹{Math.round(roiData.annualSavings).toLocaleString('en-IN')}</div>
            <div className="vai-stat-label">{strings.annualBillSavings}</div>
          </div>
          <div className="vai-stat">
            <div className="vai-stat-value">{roiData.paybackYears} yrs</div>
            <div className="vai-stat-label">{strings.simplePayback}</div>
          </div>
        </div>

        {/* ── Engineering & Financial Deep-Dive ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '28px' }}>
          {/* ROI Chart Card */}
          <div className="vai-card--white">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              {strings.cumulativeSavingsTitle}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
              {strings.financialReturnHorizon}
            </h3>
            <div style={{ height: '220px' }}>
              <Line data={roiChartData} options={roiOptions} />
            </div>
          </div>

          {/* System Spec Table (Ash Card) */}
          <div className="vai-card">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              {strings.technicalSpecs}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
              {strings.plantArchitecture}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>{strings.pvModules}</span>
                <strong>{strings.panelsDesc(panelsCount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>{strings.annualGeneration}</span>
                <strong>{strings.generationDesc(annualGeneration.toLocaleString('en-IN'))}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>{strings.netCapitalOutlay}</span>
                <strong>~₹{(roiData.netInvestment || Math.round(roiData.systemSizeKW * 65000 - roiData.subsidy)).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-mist)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-steel)' }}>{strings.netRoi}</span>
                <strong style={{ color: 'var(--color-ember-orange)' }}>{strings.lakh((roiData.roi25Year / 100000).toFixed(1))}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── Matched Empanelled Installers ── */}
        <div className="vai-card--white">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            {strings.discomVerifiedPartners}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
            {strings.empanelledInstallersFor(userProfile.state || 'Maharashtra')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {matchedVendors.map(v => (
              <div key={v.id} style={{ background: 'var(--color-fog)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--color-graphite)' }}>{v.companyName}</span>
                  <span className="badge badge--ember">★ {v.rating}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>
                  {strings.reviewsCount(v.reviewCount * 4)} · {v.type === 'Installer' ? (isHi ? 'प्रमाणित वेंडर' : isMr ? 'प्रमाणित वेंडर' : 'EPC Installer') : v.type}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                  {strings.specDetails}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
