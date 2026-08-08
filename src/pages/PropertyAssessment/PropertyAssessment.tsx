import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Sun, Mountains, CheckCircle, XCircle, Ruler,
  HouseLine, Compass, Lightning, CurrencyInr, Info, Plant,
  CaretRight, ChartBar, Certificate, Scales, MapPin, Drop
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { HeatmapChart } from '../../components/ui/bklit';
import { HOURLY_IRRADIANCE_GRID, getSolarHoursPerDay } from '../../data/solarIrradiance';
import { getStateTariffHistory } from '../../data/stateElectricityRates';
import pmSuryaGharData from '../../knowledge/pmSuryaGhar.json';
import solarPoliciesData from '../../knowledge/solarPoliciesAndSchemes.json';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Special states getting additional 10% subsidy under PM Surya Ghar
const SPECIAL_STATES = [
  'Himachal Pradesh', 'Uttarakhand', 'Assam', 'Sikkim', 'Arunachal Pradesh',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Jammu & Kashmir'
];

export const PropertyAssessment: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'roof' | 'land'>('roof');

  const state = userProfile.state || 'Maharashtra';
  const isSpecialState = SPECIAL_STATES.includes(state);

  return (
    <main className="container pb-12" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <header className="page-header mt-6 mb-6">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#7A9484', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '3px 10px', borderRadius: '999px', marginBottom: '0.5rem' }}>
          <ShieldCheck size={13} weight="duotone" color="#A8FF3E" />
          Knowledge-Base Channelized Assessment
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.125rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#ECF2EE' }}>
          {t('propertyAssessment') || 'Property Assessment'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7A9484', marginTop: '0.25rem' }}>
          MNRE &amp; PM Surya Ghar compliant solar potential evaluation for {state}.
        </p>
      </header>

      {/* Tabs */}
      <div className="tabs mb-6">
        <button
          className={`tab-btn ${activeTab === 'roof' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('roof')}
          style={{ fontSize: '0.8125rem', padding: '8px 18px' }}
        >
          <HouseLine size={15} weight="duotone" style={{ marginRight: '6px' }} />
          {t('roofAnalysis') || 'Rooftop Solar Assessment'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'land' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('land')}
          style={{ fontSize: '0.8125rem', padding: '8px 18px' }}
        >
          <Mountains size={15} weight="duotone" style={{ marginRight: '6px' }} />
          {t('landSolar') || 'PM-KUSUM Land Solar'}
        </button>
      </div>

      {activeTab === 'roof' && <RoofAnalysis state={state} isSpecialState={isSpecialState} />}
      {activeTab === 'land' && <LandSolar state={state} />}

      {/* Official Government Eligibility Footer Card */}
      <div style={{
        background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px',
        padding: '1.5rem 1.75rem', marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#ECF2EE', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} weight="duotone" color="#A8FF3E" />
            Official Government Schemes Compliance (MNRE Verified)
          </h3>
          <span style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600 }}>Portal: pmsuryaghar.gov.in</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {/* PM Surya Ghar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <CheckCircle size={20} weight="duotone" color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ECF2EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {pmSuryaGharData.schemeOverview.name}
                <span style={{ fontSize: '0.6875rem', color: '#A8FF3E', background: 'rgba(168,255,62,0.1)', padding: '2px 8px', borderRadius: '999px' }}>Up to ₹78,000</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px', lineHeight: 1.5 }}>
                Direct Benefit Transfer (DBT) to consumer bank account. Up to 300 units free electricity/mo.
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#4A6055', marginTop: '6px' }}>
                ALMM Indian Solar PV modules mandatory · Collateral-free loan available @ ~7% p.a.
              </div>
            </div>
          </div>

          {/* State Net Metering */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <CheckCircle size={20} weight="duotone" color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ECF2EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                CEA Net Metering Standard ({state})
                <span style={{ fontSize: '0.6875rem', color: '#60A5FA', background: 'rgba(96,165,250,0.1)', padding: '2px 8px', borderRadius: '999px' }}>Active</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px', lineHeight: 1.5 }}>
                Bi-directional net meter installed by DISCOM. Surplus solar power exported to grid credited against monthly bill.
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#4A6055', marginTop: '6px' }}>
                Sanctioned load check required by DISCOM within 15–30 days.
              </div>
            </div>
          </div>

          {/* PM-KUSUM */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <Plant size={20} weight="duotone" color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ECF2EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                PM-KUSUM Scheme (Component A/B/C)
                <span style={{ fontSize: '0.6875rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '999px' }}>30%–50% Subsidy</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px', lineHeight: 1.5 }}>
                Grid-connected solar power plants (0.5 MW–2 MW) on barren/fallow land or solar agricultural pumps (2–10 HP).
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#4A6055', marginTop: '6px' }}>
                Target: 30,800 MW total capacity for farmers &amp; landowners.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ═══════════════════════════════════════════════════════
   ROOFTOP ANALYSIS COMPONENT
═══════════════════════════════════════════════════════ */
const RoofAnalysis: React.FC<{ state: string; isSpecialState: boolean }> = ({ state, isSpecialState }) => {
  const { userProfile } = useApp();
  const [analyzed, setAnalyzed] = useState(false);
  const [roofArea, setRoofArea] = useState<number | ''>(userProfile.roofArea || userProfile.roofSqFt ? Number(userProfile.roofArea || userProfile.roofSqFt) : '');
  const [roofType, setRoofType] = useState('RCC Flat');
  const [buildingAge, setBuildingAge] = useState('0-5 years');
  const [shading, setShading] = useState('None');
  const [orientation, setOrientation] = useState('South');

  const discom = (userProfile as any).discom || 'State DISCOM';
  const monthlyBill = Number((userProfile as any).billSize || (userProfile as any).avgBill || (userProfile as any).billAmount || 3200);

  // Irradiance data for state
  const irradiance = getSolarHoursPerDay(state);
  const psh = irradiance.average;

  // Current tariff
  const tariffHistory = getStateTariffHistory(state, discom);
  const currentTariff = tariffHistory[tariffHistory.length - 1]?.rate || 7.5;

  // Calculation logic based on PM Surya Ghar requirements
  const calc = useMemo(() => {
    const areaNum = Number(roofArea) || 800;
    const maxViableKW = Math.max(1, Math.floor(areaNum / 107));
    
    // Monthly consumption units
    const monthlyUnits = monthlyBill / currentTariff;
    const annualUnits = monthlyUnits * 12;

    // Required capacity to meet consumption: Annual Units / (365 * PSH * 0.77)
    const requiredKW = annualUnits / (365 * psh * 0.77);
    const recommendedKW = Math.max(1, Math.min(maxViableKW, Math.ceil(requiredKW * 2) / 2));

    // Usable shadow-free area (60% to 75% depending on shading)
    const usableAreaFactor = shading === 'None' ? 0.75 : shading === 'Partial' ? 0.60 : 0.45;
    const usableAreaSqFt = Math.round(areaNum * usableAreaFactor);

    // Number of panels (using standard 400W ALMM-listed monocrystalline PV modules)
    const panelsCount = Math.ceil((recommendedKW * 1000) / 400);

    // PM Surya Ghar Subsidy calculation from pmSuryaGhar.json
    let subsidy = 0;
    if (recommendedKW <= 1) subsidy = 30000;
    else if (recommendedKW <= 2) subsidy = 60000;
    else subsidy = 78000; // Capped at 78k for residential

    if (isSpecialState) {
      subsidy = Math.round(subsidy * 1.10); // Additional 10% for special states
    }

    // Benchmark system cost: ₹45,000/kW for <=3kW, ₹40,000/kW for >3kW
    const costPerKW = recommendedKW <= 3 ? 45000 : 40000;
    const systemCost = Math.round(recommendedKW * costPerKW);
    const netInvestment = Math.max(0, systemCost - subsidy);

    // Generation & Financials
    const annualGenerationKWh = Math.round(recommendedKW * psh * 365 * 0.77);
    const monthlyGenerationKWh = Math.round(annualGenerationKWh / 12);
    const annualSavings = Math.round(Math.min(annualGenerationKWh, annualUnits) * currentTariff);
    const paybackYears = netInvestment > 0 ? parseFloat((netInvestment / annualSavings).toFixed(1)) : 0;

    // Sub-scores (0-100)
    const solarResourceScore = Math.round(Math.min(100, Math.max(30, ((psh - 4.0) / 1.5) * 60 + 40)));
    
    let roofSuitabilityScore = areaNum >= 1000 ? 95 : areaNum >= 500 ? 85 : 70;
    if (roofType === 'RCC Flat' || roofType === 'Terrace') roofSuitabilityScore = Math.min(100, roofSuitabilityScore + 8);
    if (roofType === 'Metal Sheet') roofSuitabilityScore = Math.max(40, roofSuitabilityScore - 5);

    const shadingScore = shading === 'None' ? 95 : shading === 'Partial' ? 70 : 45;
    const structuralScore = buildingAge === '0-5 years' ? 98 : buildingAge === '5-15 years' ? 88 : buildingAge === '15-30 years' ? 72 : 50;

    const orientationBonus = orientation === 'South' ? 10 : orientation.includes('South') ? 5 : 0;
    const overallScore = Math.round(
      Math.min(100, (solarResourceScore * 0.3) + (roofSuitabilityScore * 0.25) + (shadingScore * 0.25) + (structuralScore * 0.2) + orientationBonus)
    );

    return {
      maxViableKW,
      recommendedKW,
      panelsCount,
      usableAreaSqFt,
      subsidy,
      systemCost,
      netInvestment,
      annualGenerationKWh,
      monthlyGenerationKWh,
      annualSavings,
      paybackYears,
      solarResourceScore,
      roofSuitabilityScore,
      shadingScore,
      structuralScore,
      overallScore
    };
  }, [roofArea, roofType, buildingAge, shading, orientation, psh, monthlyBill, currentTariff, isSpecialState]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
      {/* Input Form Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem'
        }}>
          <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#ECF2EE', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ruler size={16} weight="duotone" color="#A8FF3E" />
            Rooftop &amp; Structural Inputs
          </h4>

          {/* Roof Area */}
          <div className="form-group mb-4">
            <label className="label" htmlFor="roofArea" style={{ fontSize: '0.75rem', color: '#7A9484' }}>
              Total Roof Area (sq. ft.)
            </label>
            <input
              type="number"
              id="roofArea"
              className="input"
              value={roofArea}
              onChange={e => setRoofArea(Math.max(50, Number(e.target.value) || 0))}
              placeholder="e.g. 800"
              min="50"
              style={{ fontSize: '0.875rem' }}
            />
            <span style={{ fontSize: '0.6875rem', color: '#4A6055', marginTop: '4px' }}>
              PM Surya Ghar standard: ~107 sq ft required per 1 kW system.
            </span>
          </div>

          {/* Roof Type */}
          <div className="form-group mb-4">
            <label className="label" htmlFor="roofType" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Roof Construction</label>
            <select id="roofType" className="input select" value={roofType} onChange={e => setRoofType(e.target.value)} style={{ fontSize: '0.875rem' }}>
              <option value="RCC Flat">RCC Flat Roof (Ideal for ballasted mounting)</option>
              <option value="Terrace">Open Terrace / Open Deck</option>
              <option value="Sloped Tile">Sloped / Tiled Roof</option>
              <option value="Metal Sheet">Industrial Metal Sheet</option>
            </select>
          </div>

          {/* Orientation */}
          <div className="form-group mb-4">
            <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Tilt &amp; Direction</label>
            <select className="input select" value={orientation} onChange={e => setOrientation(e.target.value)} style={{ fontSize: '0.875rem' }}>
              <option value="South">True South (True solar optimum 15°–20° tilt)</option>
              <option value="South-East">South-East (Good morning generation)</option>
              <option value="South-West">South-West (Good evening generation)</option>
              <option value="East / West">East / West (Dual-tilt layout)</option>
              <option value="North">North (Not recommended - 25% loss)</option>
            </select>
          </div>

          {/* Shading */}
          <div className="form-group mb-4">
            <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Sunlight Obstruction (Shading)</label>
            <div className="toggle-group">
              {['None', 'Partial', 'Heavy'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${shading === opt ? 'toggle-option--selected' : ''}`}
                  onClick={() => setShading(opt)}
                  style={{ fontSize: '0.8125rem', padding: '8px' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Building Age */}
          <div className="form-group mb-4">
            <label className="label" htmlFor="buildingAge" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Building Structural Age</label>
            <select id="buildingAge" className="input select" value={buildingAge} onChange={e => setBuildingAge(e.target.value)} style={{ fontSize: '0.875rem' }}>
              <option value="0-5 years">0–5 years (New / Excellent load bearing)</option>
              <option value="5-15 years">5–15 years (Good condition)</option>
              <option value="15-30 years">15–30 years (Structural check recommended)</option>
              <option value="30+ years">30+ years (Requires structural reinforcement)</option>
            </select>
          </div>

          <button className="btn btn-primary w-full justify-center mt-2" onClick={() => setAnalyzed(true)} style={{ fontSize: '0.875rem' }}>
            Recalculate Rooftop Potential <CaretRight size={15} />
          </button>
        </div>
      </div>

      {/* Results Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {analyzed ? (
          <>
            {/* Score & Capacity Card */}
            <div style={{
              background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#A8FF3E', lineHeight: 1 }}>
                    {calc.overallScore}<span style={{ fontSize: '1rem', color: '#4A6055' }}>/100</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A9484', marginTop: '4px' }}>
                    Rooftop Feasibility Score
                  </div>
                </div>
                <span className={`badge ${calc.overallScore >= 75 ? 'badge--accent' : 'badge--amber'}`}>
                  {calc.overallScore >= 85 ? 'OPTIMAL FEASIBILITY' : calc.overallScore >= 70 ? 'GOOD FEASIBILITY' : 'MODERATE'}
                </span>
              </div>

              {/* Breakdown Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#7A9484', marginBottom: '3px' }}>
                    <span>Solar Resource ({psh} PSH/day)</span>
                    <span style={{ fontWeight: 700, color: '#ECF2EE' }}>{calc.solarResourceScore}/100</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${calc.solarResourceScore}%`, background: '#22C55E', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#7A9484', marginBottom: '3px' }}>
                    <span>Roof Suitability ({roofArea} sq ft)</span>
                    <span style={{ fontWeight: 700, color: '#ECF2EE' }}>{calc.roofSuitabilityScore}/100</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${calc.roofSuitabilityScore}%`, background: '#A8FF3E', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#7A9484', marginBottom: '3px' }}>
                    <span>Shading Clearance ({shading})</span>
                    <span style={{ fontWeight: 700, color: '#ECF2EE' }}>{calc.shadingScore}/100</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${calc.shadingScore}%`, background: '#60A5FA', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#7A9484', marginBottom: '3px' }}>
                    <span>Structural Integrity ({buildingAge})</span>
                    <span style={{ fontWeight: 700, color: '#ECF2EE' }}>{calc.structuralScore}/100</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${calc.structuralScore}%`, background: '#F59E0B', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '1rem 0' }} />

              {/* System Recommendation Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600, textTransform: 'uppercase' }}>Recommended Capacity</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#A8FF3E', fontFamily: 'Outfit, sans-serif' }}>
                    {calc.recommendedKW} kW
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#7A9484' }}>{calc.panelsCount} × 400W ALMM panels</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600, textTransform: 'uppercase' }}>PM Surya Ghar Subsidy</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{calc.subsidy.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#7A9484' }}>
                    {isSpecialState ? 'Includes 10% Special State bonus' : 'Direct DBT transfer'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600, textTransform: 'uppercase' }}>Est. Annual Generation</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ECF2EE' }}>
                    {calc.annualGenerationKWh.toLocaleString('en-IN')} kWh
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#7A9484' }}>~{calc.monthlyGenerationKWh} units / month</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600, textTransform: 'uppercase' }}>Est. Payback Period</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ECF2EE' }}>
                    {calc.paybackYears} years
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#7A9484' }}>25-year system lifespan</div>
                </div>
              </div>
            </div>

            {/* Annual Irradiance Heatmap using BKLIT UI (@bklit/heatmap-chart) */}
            <div style={{
              background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#ECF2EE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sun size={15} weight="duotone" color="#A8FF3E" />
                  Hourly Irradiance Matrix ({state})
                </h4>
                <span style={{ fontSize: '0.6875rem', color: '#4A6055' }}>Avg {psh} kWh/m²/day</span>
              </div>

              <HeatmapChart
                data={HOURLY_IRRADIANCE_GRID}
                maxVal={psh * 1.1}
                unit="kWh/m²"
              />
            </div>
          </>
        ) : (
          <div style={{
            background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '3rem 2rem',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sun size={40} weight="duotone" color="#7A9484" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#7A9484', fontSize: '0.875rem' }}>Fill in your property details and click analyze to compute rooftop solar feasibility.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   LAND SOLAR COMPONENT (PM-KUSUM ALIGNED)
═══════════════════════════════════════════════════════ */
const LandSolar: React.FC<{ state: string }> = ({ state }) => {
  const [analyzed, setAnalyzed] = useState(false);
  const [landArea, setLandArea] = useState<number | ''>(5);
  const [terrain, setTerrain] = useState('Flat');
  const [soilType, setSoilType] = useState('Sandy / Loamy');
  const [gridDistance, setGridDistance] = useState('< 1 km');
  const [waterAccess, setWaterAccess] = useState('Yes');
  const [ownership, setOwnership] = useState('Own');

  const psh = getSolarHoursPerDay(state).average;

  // Calculation based on solarPoliciesAndSchemes.json (PM-KUSUM rules)
  const calc = useMemo(() => {
    const areaNum = Number(landArea) || 5;
    // Terrain capacity modifier
    const terrainMod = terrain === 'Flat' ? 1.0 : terrain === 'Gently Sloped' ? 0.88 : 0.65;
    
    // ~200 kW capacity per acre for utility / community scale
    const estimatedCapacityKW = Math.round(areaNum * 200 * terrainMod);
    const capacityMW = (estimatedCapacityKW / 1000).toFixed(2);

    // Annual generation: kW * PSH * 365 * 0.78 efficiency
    const annualGenerationKWh = Math.round(estimatedCapacityKW * psh * 365 * 0.78);
    const annualGenerationLakhs = (annualGenerationKWh / 100000).toFixed(1);

    // PM-KUSUM Matching
    let schemeMatch = 'PM-KUSUM Component A';
    let schemeDesc = '0.5 MW to 2 MW grid-connected solar power plant on barren or fallow farmland.';
    if (areaNum < 2) {
      schemeMatch = 'PM-KUSUM Component B / C';
      schemeDesc = 'Off-grid standalone solar pumps (2–10 HP) or solarization of agricultural feeder pumps.';
    }

    // Revenue Options under PM-KUSUM
    // Option 1: Lease land to developer @ ₹35,000 to ₹50,000 per acre/year
    const annualLeaseMin = Math.round(areaNum * 35000);
    const annualLeaseMax = Math.round(areaNum * 52000);

    // Option 2: Sale of power to DISCOM at PPA tariff ~₹3.00 / unit
    const ppaTariff = 3.00;
    const grossPpaIncome = Math.round((annualGenerationKWh * ppaTariff) / 100000); // in Lakhs

    // Feasibility Score based on Grid Distance & Terrain
    const gridScore = gridDistance === '< 1 km' ? 95 : gridDistance === '1 - 3 km' ? 80 : gridDistance === '3 - 5 km' ? 62 : 40;
    const terrainScore = terrain === 'Flat' ? 95 : terrain === 'Gently Sloped' ? 78 : 50;
    const waterScore = waterAccess === 'Yes' ? 90 : 65;
    const overallFeasibility = Math.round((gridScore * 0.45) + (terrainScore * 0.35) + (waterScore * 0.2));

    return {
      estimatedCapacityKW,
      capacityMW,
      annualGenerationKWh,
      annualGenerationLakhs,
      schemeMatch,
      schemeDesc,
      annualLeaseMin,
      annualLeaseMax,
      grossPpaIncome,
      overallFeasibility
    };
  }, [landArea, terrain, gridDistance, waterAccess, psh]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
      {/* Inputs Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem'
        }}>
          <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#ECF2EE', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mountains size={16} weight="duotone" color="#A8FF3E" />
            Land Parcel Specifications
          </h4>

          {/* Land Area */}
          <div className="form-group mb-4">
            <label className="label" htmlFor="landArea" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Total Land Area (Acres)</label>
            <input
              type="number"
              id="landArea"
              className="input"
              value={landArea}
              onChange={e => setLandArea(Math.max(0.2, Number(e.target.value) || 0))}
              placeholder="e.g. 5"
              min="0.2"
              step="0.5"
              style={{ fontSize: '0.875rem' }}
            />
            <span style={{ fontSize: '0.6875rem', color: '#4A6055', marginTop: '4px' }}>
              ~2 to 5 acres required for 1 MW solar plant under PM-KUSUM Component A.
            </span>
          </div>

          {/* Terrain */}
          <div className="form-group mb-4">
            <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Terrain Topology</label>
            <div className="toggle-group">
              {['Flat', 'Gently Sloped', 'Hilly'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${terrain === opt ? 'toggle-option--selected' : ''}`}
                  onClick={() => setTerrain(opt)}
                  style={{ fontSize: '0.8125rem', padding: '8px' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Distance to Substation */}
          <div className="form-group mb-4">
            <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Distance to Nearest DISCOM Substation (33/11 kV)</label>
            <select className="input select" value={gridDistance} onChange={e => setGridDistance(e.target.value)} style={{ fontSize: '0.875rem' }}>
              <option value="< 1 km">&lt; 1 km (Optimal - Minimal evacuation cost)</option>
              <option value="1 - 3 km">1 – 3 km (Feasible - Standard transmission line)</option>
              <option value="3 - 5 km">3 – 5 km (Requires line extension)</option>
              <option value="> 5 km">&gt; 5 km (High transmission interconnect cost)</option>
            </select>
          </div>

          {/* Soil Type */}
          <div className="form-group mb-4">
            <label className="label" htmlFor="soilType" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Soil &amp; Land Classification</label>
            <select id="soilType" className="input select" value={soilType} onChange={e => setSoilType(e.target.value)} style={{ fontSize: '0.875rem' }}>
              <option value="Sandy / Loamy">Barren / Fallow Land (Ideal for KUSUM)</option>
              <option value="Agricultural">Agricultural Land (Suitable for Agri-PV / Dual use)</option>
              <option value="Clay / Marshy">Clay / Marshy (Requires reinforced piling)</option>
              <option value="Rocky">Rocky Strata (Requires specialized drilling)</option>
            </select>
          </div>

          {/* Water Access */}
          <div className="form-group mb-4">
            <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Module Cleaning Water Access</label>
            <div className="toggle-group">
              {['Yes', 'No'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${waterAccess === opt ? 'toggle-option--selected' : ''}`}
                  onClick={() => setWaterAccess(opt)}
                  style={{ fontSize: '0.8125rem', padding: '8px' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Ownership */}
          <div className="form-group mb-4">
            <label className="label" htmlFor="ownership" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Ownership Title</label>
            <select id="ownership" className="input select" value={ownership} onChange={e => setOwnership(e.target.value)} style={{ fontSize: '0.875rem' }}>
              <option value="Own">Individual Owner / Freehold</option>
              <option value="Lease">Leased / Long-term Lease agreement</option>
              <option value="Shared">Co-operative / Joint Ownership</option>
            </select>
          </div>

          <button className="btn btn-primary w-full justify-center mt-2" onClick={() => setAnalyzed(true)} style={{ fontSize: '0.875rem' }}>
            Recalculate Land Potential <CaretRight size={15} />
          </button>
        </div>
      </div>

      {/* Results Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {analyzed ? (
          <div style={{
            background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#ECF2EE', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mountains size={18} weight="duotone" color="#A8FF3E" />
                  Land Solar Revenue &amp; Capacity
                </h3>
              </div>
              <span className={`badge ${calc.overallFeasibility >= 75 ? 'badge--accent' : 'badge--amber'}`}>
                {calc.overallFeasibility >= 80 ? 'HIGH FEASIBILITY ✓' : 'MODERATE FEASIBILITY'}
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Capacity</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A8FF3E', fontFamily: 'Outfit, sans-serif' }}>
                  {calc.estimatedCapacityKW} kW
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>({calc.capacityMW} MW plant size)</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#4A6055', fontWeight: 600, textTransform: 'uppercase' }}>Est. Annual Generation</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ECF2EE', fontFamily: 'Outfit, sans-serif' }}>
                  {calc.annualGenerationLakhs} Lakh
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>kWh units / year</div>
              </div>
            </div>

            {/* Scheme Match Card */}
            <div style={{ background: 'rgba(168, 255, 62, 0.05)', border: '1px solid rgba(168, 255, 62, 0.18)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', color: '#A8FF3E', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                MNRE Scheme Match
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ECF2EE', marginTop: '2px' }}>
                {calc.schemeMatch}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px', lineHeight: 1.5 }}>
                {calc.schemeDesc}
              </div>
            </div>

            {/* Revenue Models */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE', margin: 0 }}>Projected Monetization Models:</h5>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ECF2EE' }}>Model A: Developer Land Lease</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#22C55E' }}>
                    ₹{(calc.annualLeaseMin / 100000).toFixed(2)} – {(calc.annualLeaseMax / 100000).toFixed(2)} L/yr
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '3px' }}>
                  Passive annual income (@ ₹35k–₹50k/acre) with 5% escalation every 2 years. Zero investment needed.
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ECF2EE' }}>Model B: DISCOM Power Purchase (PPA)</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#A8FF3E' }}>
                    ~₹{calc.grossPpaIncome} Lakh/yr
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '3px' }}>
                  Sell power directly to {state} DISCOM at fixed PPA rate ~₹3.00/unit under 25-year contract.
                </div>
              </div>
            </div>

            <button className="btn btn-secondary w-full justify-center" style={{ fontSize: '0.875rem' }}>
              Connect with Empanelled KUSUM Developers <CaretRight size={15} />
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '3rem 2rem',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <Mountains size={40} weight="duotone" color="#7A9484" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#7A9484', fontSize: '0.875rem' }}>Fill in your land details to estimate PM-KUSUM solar power plant potential.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAssessment;
