import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Sun, Mountains, CheckCircle, XCircle, Ruler,
  HouseLine, Compass, Lightning, CurrencyInr, Info, Plant,
  CaretRight, ChartBar, Certificate, Scales, MapPin, Drop
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { HeatmapChart } from '../../components/ui/bklit';
import { recordPropertyAssessmentAction } from '../../services/centralizedContext';
import { HOURLY_IRRADIANCE_GRID, getSolarHoursPerDay } from '../../data/solarIrradiance';
import { getStateTariffHistory } from '../../data/stateElectricityRates';
import pmSuryaGharData from '../../knowledge/pmSuryaGhar.json';
import solarPoliciesData from '../../knowledge/solarPoliciesAndSchemes.json';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SPECIAL_STATES = [
  'Himachal Pradesh', 'Uttarakhand', 'Assam', 'Sikkim', 'Arunachal Pradesh',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Jammu & Kashmir'
];

export const PropertyAssessment: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile, language } = useApp();
  const [activeTab, setActiveTab] = useState<'roof' | 'land'>('roof');

  const state = userProfile.state || 'Maharashtra';
  const isSpecialState = SPECIAL_STATES.includes(state);

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const tabLabels = {
    roof: isHi ? "रूफटॉप सौर मूल्यांकन" : isMr ? "छतावरील सौर मूल्यांकन" : "Rooftop Solar Assessment",
    land: isHi ? "पीएम-कुसुम भूमि सौर" : isMr ? "पीएम-कुसुम जमीन सौर" : "PM-KUSUM Land Solar",
  };

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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tabs (Ventriloc Capsule Pill) */}
        <div className="tabs" style={{ marginTop: '4px' }}>
          <button
            className={`tab-btn ${activeTab === 'roof' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('roof')}
          >
            <HouseLine size={15} style={{ marginRight: '6px', display: 'inline-block' }} />
            {tabLabels.roof}
          </button>
          <button
            className={`tab-btn ${activeTab === 'land' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('land')}
          >
            <Mountains size={15} style={{ marginRight: '6px', display: 'inline-block' }} />
            {tabLabels.land}
          </button>
        </div>

        {activeTab === 'roof' && <RoofAnalysis state={state} isSpecialState={isSpecialState} />}
        {activeTab === 'land' && <LandSolar state={state} />}

        {/* Official Government Eligibility Footer Card (Ventriloc Ash container) */}
        <div
          style={{
            background: 'var(--color-ash)',
            borderRadius: 'var(--radius-cards)',
            padding: '28px 32px',
            marginTop: '40px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--color-brass)" />
              Official Government Schemes Compliance (MNRE Verified)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>Portal: pmsuryaghar.gov.in</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* PM Surya Ghar */}
            <div style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-graphite)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {pmSuryaGharData.schemeOverview.name}
                <span className="badge badge--ember">Up to ₹78,000</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px', lineHeight: 1.5 }}>
                Direct Benefit Transfer (DBT) to consumer bank account. Up to 300 units free electricity per month.
              </div>
            </div>

            {/* State Net Metering */}
            <div style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-graphite)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                CEA Net Metering Standard ({state})
                <span className="badge badge--success">Active</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px', lineHeight: 1.5 }}>
                Bi-directional net meter installed by DISCOM. Surplus solar power exported to grid credited against monthly bill.
              </div>
            </div>

            {/* PM-KUSUM */}
            <div style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-graphite)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                PM-KUSUM Component A/B/C
                <span className="badge badge--brass">Agri Solar</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-steel)', marginTop: '8px', lineHeight: 1.5 }}>
                Subsidized standalone solar pumps (up to 60%) and 25-year developer lease contracts on agricultural land.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ── Rooftop Analysis Component ── */
const RoofAnalysis: React.FC<{ state: string; isSpecialState: boolean }> = ({ state, isSpecialState }) => {
  const { userProfile, language } = useApp();
  const [roofArea, setRoofArea] = useState<number | string>(userProfile.roofArea || 800);
  const [roofType, setRoofType] = useState('Flat Concrete (RCC)');
  const [shadow, setShadow] = useState('Minimal (< 10%)');
  const [isCalculating, setIsCalculating] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const irradianceData = getSolarHoursPerDay(state);
  const peakSunHours = irradianceData.average;

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const strings = {
    geometryParams: isHi ? "रूफटॉप ज्यामिति पैरामीटर" : isMr ? "छतावरील भूमितीचे निकष" : "Rooftop Geometry Parameters",
    inputTitle: isHi ? "छत इनपुट और सौर क्षमता" : isMr ? "छताची माहिती आणि सौर क्षमता" : "Rooftop Input & Solar Potential",
    roofAreaLabel: isHi ? "उपयोगी छाया-मुक्त छत क्षेत्र (वर्ग फीट)" : isMr ? "छाया नसलेली छतावरील जागा (चौ. फूट)" : "Usable Shadow-Free Roof Area (sq ft)",
    benchmarkText: isHi ? "मानक बेंचमार्क: 107 वर्ग फीट प्रति 1 kW सिस्टम।" : isMr ? "प्रमाणित निकष: १०७ चौ. फूट प्रति १ kW सोलर सिस्टीम." : "Standard benchmark: 107 sq ft per 1 kW system.",
    surfaceTypeLabel: isHi ? "छत की सतह का प्रकार" : isMr ? "छताच्या पृष्ठभागाचा प्रकार" : "Roof Surface Type",
    shadowLabel: isHi ? "छाया / व्यवधान स्तर" : isMr ? "सावली / अडथळ्यांची पातळी" : "Shadow / Obstruction Level",
    calcPotentialBtn: isHi ? "सौर क्षमता की गणना करें →" : isMr ? "सौर क्षमतेची गणना करा →" : "Calculate Solar Potential →",
    calculating: isHi ? "सौर क्षमता की गणना की जा रही है..." : isMr ? "सौर क्षमतेची गणना केली जात आहे..." : "Calculating Solar Potential...",
    heatmapTitle: isHi ? "सौर विकिरण हीटमैप" : isMr ? "सौर किरणे हीटमॅप" : "Solar Irradiance Heatmap",
    peakSunHoursTitle: isHi ? `${state} मासिक पीक सन ऑवर्स (PSH)` : isMr ? `${state}चे मासिक पीक सन ऑवर्स (PSH)` : `${state} Monthly Peak Sun Hours (PSH)`,
    avgPsh: isHi ? `औसत ${peakSunHours} PSH` : isMr ? `सरासरी ${peakSunHours} PSH` : `${peakSunHours} PSH Avg`,
    
    // Sizing Report
    engineeringSynthesis: isHi ? "इंजीनियरिंग संश्लेषण" : isMr ? "इंजिनिअरिंग विश्लेषण" : "Engineering Synthesis",
    estCapacityTitle: isHi ? "अनुमानित रूफटॉप क्षमता" : isMr ? "छतावरील अंदाजे सोलर क्षमता" : "Estimated Rooftop Capacity",
    usableKwPeak: isHi ? "उपयोगी kW पीक" : isMr ? "वापरण्यायोग्य kW पीक" : "Usable kW Peak",
    solarScore: isHi ? "सोलर स्कोर /100" : isMr ? "सोलर स्कोर /१००" : "Solar Score /100",
    dailyGen: isHi ? "दैनिक उत्पादन" : isMr ? "दैनिक निर्मिती" : "Daily Generation",
    monthlyYield: isHi ? "मासिक उपज" : isMr ? "मासिक वीज निर्मिती" : "Monthly Yield",
    annualGen: isHi ? "वार्षिक उत्पादन" : isMr ? "वार्षिक वीज निर्मिती" : "Annual Generation",
    pmSubsidy: isHi ? "पीएम सब्सिडी डीबीटी" : isMr ? "पीएम अनुदान डीबीटी" : "PM Subsidy DBT",
    maxCapacity: isHi ? "अधिकतम सैद्धांतिक क्षमता" : isMr ? "जास्तीत जास्त सैद्धांतिक क्षमता" : "Max Theoretical Capacity",
    shadingLoss: isHi ? "छाया के कारण नुकसान" : isMr ? "सावलीमुळे होणारे नुकसान" : "Shading/Obstruction Loss",
    cleanEnergyImpact: isHi ? "हरित ऊर्जा प्रभाव (CO2 कमी)" : isMr ? "हरित ऊर्जा प्रभाव (CO2 कमी)" : "Clean Energy Impact (CO2 Offset)",
    co2Offset: (kg: string) => isHi ? `~${kg} किग्रा/वर्ष CO2` : isMr ? `~${kg} किग्रा/वर्ष CO2` : `~${kg} kg/yr CO2`,
    
    // Tip
    discomLoadGuideline: isHi ? "डिस्कॉम स्वीकृत लोड दिशानिर्देश" : isMr ? "डिस्कॉम मंजूर वीजभार मार्गदर्शक" : "DISCOM Sanctioned Load Guideline",
    guidelineDesc: (kw: number) => isHi 
      ? `${state} नेट-मीटरिंग नियमों के तहत, स्वीकृत लोड के 100% तक की सौर क्षमता को निर्बाध रूप से मंजूरी दी जाती है। ${kw} kW पर आकार देने के लिए एक मिलान स्वीकृत लोड की आवश्यकता होती है।`
      : isMr 
        ? `${state} नेट-मीटरिंग नियमांनुसार, मंजूर वीजभाराच्या १००% पर्यंत सोलर क्षमतेला सहज मंजुरी मिळते. ${kw} kW सोलर क्षमतेसाठी तेवढ्याच मंजूर वीजभाराची आवश्यकता असते.`
        : `Under ${state} net-metering regulations, solar capacity up to 100% of sanctioned load is approved seamlessly. Sizing at ${kw} kW requires a matching sanctioned load.`,
  };

  const calc = useMemo(() => {
    const area = Number(roofArea) || 800;
    const maxCapacityKW = +(area / 107).toFixed(1);
    
    const shadowMultiplier = shadow === 'None' ? 1.0 : shadow === 'Minimal (< 10%)' ? 0.93 : shadow === 'Moderate (10-25%)' ? 0.80 : 0.65;
    const effectiveKW = +(maxCapacityKW * shadowMultiplier).toFixed(1);

    // FIX: Generation calculations are based on effectiveKW (usable capacity after shading) rather than maxCapacityKW!
    const dailyGenerationKWh = +(effectiveKW * peakSunHours).toFixed(1);
    const monthlyGenerationKWh = Math.round(dailyGenerationKWh * 30);
    const annualGenerationKWh = Math.round(dailyGenerationKWh * 365);

    const baseSubsidy = effectiveKW <= 1 ? 30000 : effectiveKW <= 2 ? 60000 : 78000;
    const finalSubsidy = isSpecialState ? Math.round(baseSubsidy * 1.1) : baseSubsidy;

    // CO2 offset estimate: 1 kW solar offsets approx 1200kg of CO2 per year in India
    const co2OffsetKg = Math.round(effectiveKW * 1200);

    return {
      maxCapacityKW,
      effectiveKW,
      dailyGenerationKWh,
      monthlyGenerationKWh,
      annualGenerationKWh,
      finalSubsidy,
      co2OffsetKg,
      shadingLossPercent: Math.round((1 - shadowMultiplier) * 100),
      overallScore: Math.min(100, Math.round(85 * shadowMultiplier + (peakSunHours / 5.5) * 15)),
    };
  }, [roofArea, roofType, shadow, peakSunHours, isSpecialState]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setAnalyzed(true);
      recordPropertyAssessmentAction({ roofArea: Number(roofArea) || 800, score: calc.overallScore, maxCapacityKW: calc.maxCapacityKW }, userProfile);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
      {/* Left Column: Form & Assessment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: 'var(--color-ash)', borderRadius: 'var(--radius-cards)', padding: '28px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
            {strings.geometryParams}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '20px' }}>
            {strings.inputTitle}
          </h3>

          <div className="form-group">
            <label className="label">{strings.roofAreaLabel}</label>
            <input
              type="number"
              value={roofArea}
              onChange={e => setRoofArea(e.target.value)}
              placeholder="e.g. 800"
            />
            <span style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px', display: 'block' }}>
              {strings.benchmarkText}
            </span>
          </div>

          <div className="form-group">
            <label className="label">{strings.surfaceTypeLabel}</label>
            <select value={roofType} onChange={e => setRoofType(e.target.value)}>
              <option value="Flat Concrete (RCC)">{isHi ? "समतल कंक्रीट (RCC)" : isMr ? "सपाट काँक्रीट (RCC)" : "Flat Concrete (RCC)"}</option>
              <option value="Slanted Tile Roof">{isHi ? "ढलान वाली टाइल की छत" : isMr ? "उतार असलेले छप्पर" : "Slanted Tile Roof"}</option>
              <option value="Metal Sheet Shed">{isHi ? "धातु की चादर का शेड" : isMr ? "मेटल शीट शेड" : "Metal Sheet Industrial Shed"}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">{strings.shadowLabel}</label>
            <select value={shadow} onChange={e => setShadow(e.target.value)}>
              <option value="None">{isHi ? "कोई नहीं (100% पूर्ण धूप)" : isMr ? "काहीही नाही (१००% पूर्ण ऊन)" : "None (100% Clear Sun)"}</option>
              <option value="Minimal (< 10%)">{isHi ? "न्यूनतम (< 10% छाया)" : isMr ? "किमान (< १०% सावली)" : "Minimal (< 10% Shadow)"}</option>
              <option value="Moderate (10-25%)">{isHi ? "मध्यम (10-25% छाया)" : isMr ? "मध्यम (१०-२५% सावली)" : "Moderate (10-25% Shadow)"}</option>
              <option value="Severe (> 25%)">{isHi ? "गंभीर (> 25% छाया)" : isMr ? "तीव्र (> २५% सावली)" : "Severe (> 25% Shadow)"}</option>
            </select>
          </div>

          <button
            className="btn btn-primary w-full justify-center"
            style={{ marginTop: '8px', cursor: isCalculating ? 'not-allowed' : 'pointer' }}
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? strings.calculating : strings.calcPotentialBtn}
          </button>
        </div>

        {/* Irradiance Heatmap Card */}
        <div style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '2px', fontFamily: 'var(--font-display)' }}>
                {strings.heatmapTitle}
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>
                {strings.peakSunHoursTitle}
              </h4>
            </div>
            <span className="badge badge--ember">{strings.avgPsh}</span>
          </div>

          <div style={{ height: '180px' }}>
            <HeatmapChart
              data={HOURLY_IRRADIANCE_GRID}
              activeColor="rgba(255, 104, 44,"
              maxVal={1.0}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Sizing Results (Ventriloc White Card) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            background: 'var(--color-canvas-white)',
            border: '1px solid var(--color-mist)',
            borderRadius: 'var(--radius-cards)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minHeight: '380px',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {isCalculating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', minHeight: '260px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '2px solid var(--color-mist)', borderTopColor: 'var(--color-ember-orange)',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ fontSize: '12px', color: 'var(--color-slate)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {strings.calculating}
              </div>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}} />
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
                  {strings.engineeringSynthesis}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>
                  {strings.estCapacityTitle}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="vai-stat" style={{ padding: '14px', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', borderRadius: '6px' }}>
                  <div className="vai-stat-value" style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--color-graphite)' }}>{calc.effectiveKW}</div>
                  <div className="vai-stat-label" style={{ fontSize: '11px', color: 'var(--color-steel)', marginTop: '2px' }}>{strings.usableKwPeak}</div>
                </div>
                <div className="vai-stat" style={{ padding: '14px', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', borderRadius: '6px' }}>
                  <div className="vai-stat-value" style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--color-graphite)' }}>{calc.overallScore}</div>
                  <div className="vai-stat-label" style={{ fontSize: '11px', color: 'var(--color-steel)', marginTop: '2px' }}>{strings.solarScore}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--color-mist)', paddingTop: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-steel)' }}>{strings.maxCapacity}</span>
                  <span style={{ color: 'var(--color-graphite)' }}>{calc.maxCapacityKW} kWp</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-steel)' }}>{strings.shadingLoss}</span>
                  <span style={{ color: '#dc2626', fontWeight: 500 }}>-{calc.shadingLossPercent}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-mist)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--color-steel)' }}>{strings.dailyGen}</span>
                  <strong style={{ color: 'var(--color-graphite)' }}>~{calc.dailyGenerationKWh} kWh/day</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-steel)' }}>{strings.monthlyYield}</span>
                  <strong style={{ color: 'var(--color-graphite)' }}>~{calc.monthlyGenerationKWh} kWh/mo</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-steel)' }}>{strings.annualGen}</span>
                  <strong style={{ color: 'var(--color-graphite)' }}>~{calc.annualGenerationKWh.toLocaleString('en-IN')} kWh/yr</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-mist)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--color-steel)' }}>{strings.cleanEnergyImpact}</span>
                  <strong style={{ color: '#16a34a' }}>{strings.co2Offset(calc.co2OffsetKg.toLocaleString('en-IN'))}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-steel)', fontWeight: 500 }}>{strings.pmSubsidy}</span>
                  <strong style={{ color: 'var(--color-ember-orange)' }}>₹{calc.finalSubsidy.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Asymmetric Role Tip */}
        <div style={{ background: 'var(--color-ivory)', borderRadius: '6px 0px 0px 6px', padding: '24px', border: '1px solid var(--color-mist)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
            {strings.discomLoadGuideline}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-steel)', lineHeight: 1.6, margin: 0 }}>
            {strings.guidelineDesc(calc.effectiveKW)}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Land Solar Analysis (PM-KUSUM) Component ── */
const LandSolar: React.FC<{ state: string }> = ({ state }) => {
  const { userProfile } = useApp();
  const [landArea, setLandArea] = useState<number | string>(5);
  const [substationDist, setSubstationDist] = useState<number | string>(2.5);
  const [analyzed, setAnalyzed] = useState(false);

  const calc = useMemo(() => {
    const acres = Number(landArea) || 5;
    const capacityMW = +(acres * 0.2).toFixed(2);
    const annualLeaseMin = Math.round(acres * 60000);
    const annualLeaseMax = Math.round(acres * 100000);
    const dist = Number(substationDist) || 2.5;
    const feasible = dist <= 5.0;

    return {
      capacityMW,
      annualLeaseMin,
      annualLeaseMax,
      feasible,
    };
  }, [landArea, substationDist]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
      <div style={{ background: 'var(--color-ash)', borderRadius: 'var(--radius-cards)', padding: '28px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
          PM-KUSUM Land Feasibility
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '20px' }}>
          Agricultural Land Solarization &amp; Leasing
        </h3>

        <div className="form-group">
          <label className="label">Unused Agricultural Land Area (Acres)</label>
          <input
            type="number"
            value={landArea}
            onChange={e => setLandArea(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="form-group">
          <label className="label">Distance to Nearest 11kV/33kV Substation (km)</label>
          <input
            type="number"
            value={substationDist}
            onChange={e => setSubstationDist(e.target.value)}
            placeholder="e.g. 2.5"
          />
          <span style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px', display: 'block' }}>
            PM-KUSUM Component A mandates distance &lt; 5 km from distribution substations.
          </span>
        </div>

        <button
          className="btn btn-primary w-full justify-center"
          style={{ marginTop: '8px' }}
          onClick={() => {
            setAnalyzed(true);
            recordPropertyAssessmentAction({ acres: Number(landArea) || 5, capacityMW: calc.capacityMW, score: calc.feasible ? 92 : 45 }, userProfile);
          }}
        >
          Calculate Land Solar Feasibility →
        </button>
      </div>

      {/* Right Column: Land Economics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            background: 'var(--color-canvas-white)',
            border: '1px solid var(--color-mist)',
            borderRadius: 'var(--radius-cards)',
            padding: '28px',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            Commercial Feasibility
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>
            Estimated Lease Returns
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase' }}>Plant Capacity</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-graphite)' }}>~{calc.capacityMW} MW</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase' }}>Estimated Annual Lease</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ember-orange)' }}>
                ₹{calc.annualLeaseMin.toLocaleString('en-IN')} – ₹{calc.annualLeaseMax.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '12px', fontSize: '13px' }}>
              <span style={{ color: calc.feasible ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                {calc.feasible ? '✓ Substation Proximity: Optimal (< 5 km)' : '⚠ Substation Distance Exceeds 5 km'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAssessment;
