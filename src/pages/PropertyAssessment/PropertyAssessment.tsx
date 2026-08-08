import React, { useState, useMemo } from 'react';
import { ShieldCheck, Sun, Mountain, CheckCircle2, XCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { HOURLY_IRRADIANCE_GRID } from '../../data/solarIrradiance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PropertyAssessment: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'roof' | 'land'>('roof');

  return (
    <main className="container pb-12">
      <header className="page-header mt-8">
        <h1>{t('propertyAssessment') || 'Property Assessment'}</h1>
        <p className="text-secondary">Analyze your property's potential for solar energy generation.</p>
      </header>

      <div className="tabs mb-6">
        <button
          className={`tab-btn ${activeTab === 'roof' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('roof')}
        >
          {t('roofAnalysis') || 'Roof Analysis'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'land' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('land')}
        >
          {t('landSolar') || 'Land Solar'}
        </button>
      </div>

      {activeTab === 'roof' && <RoofAnalysis />}
      {activeTab === 'land' && <LandSolar />}

      <div className="glass-card mt-8">
        <h3 className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-accent" /> Government Eligibility
        </h3>
        <div className="flex-col gap-3">
          <div className="glass-card glass-card--sm glass-card--no-hover flex items-center gap-3">
            <CheckCircle2 className="text-green" />
            <div className="flex-1">
              <div className="font-semibold">PM Surya Ghar: Muft Bijli Yojana</div>
              <div className="text-xs text-secondary">₹78,000 eligible based on recommended capacity.</div>
            </div>
            <button className="btn btn-secondary btn-sm">Apply</button>
          </div>
          <div className="glass-card glass-card--sm glass-card--no-hover flex items-center gap-3">
            <CheckCircle2 className="text-green" />
            <div className="flex-1">
              <div className="font-semibold">State DISCOM Net Metering</div>
              <div className="text-xs text-secondary">Applicable for residential properties.</div>
            </div>
            <button className="btn btn-secondary btn-sm">Details</button>
          </div>
          <div className="glass-card glass-card--sm glass-card--no-hover flex items-center gap-3 opacity-50">
            <XCircle className="text-red" />
            <div className="flex-1">
              <div className="font-semibold">PM-KUSUM</div>
              <div className="text-xs text-secondary">Land size &lt; minimum requirement.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const RoofAnalysis: React.FC = () => {
  const { userProfile } = useApp();
  const [analyzed, setAnalyzed] = useState(false);
  const [roofArea, setRoofArea] = useState(Number(userProfile.roofArea) || 800);
  const [roofType, setRoofType] = useState('Flat');
  const [buildingAge, setBuildingAge] = useState('0-5 years');
  const [shading, setShading] = useState('None');

  const scores = useMemo(() => {
    const base = {
      solarResource: 94,
      roofSuitability: roofArea >= 1000 ? 95 : roofArea >= 500 ? 85 : 70,
      shadingImpact: shading === 'None' ? 92 : shading === 'Partial' ? 78 : 55,
      structuralOK: buildingAge === '0-5 years' ? 95 : buildingAge === '5-15 years' ? 88 : buildingAge === '15-30 years' ? 75 : 60,
    };
    const overall = Math.round((base.solarResource + base.roofSuitability + base.shadingImpact + base.structuralOK) / 4);
    return { ...base, overall };
  }, [roofArea, shading, buildingAge]);

  const recommendedKW = Math.max(1, Math.round(roofArea / 100));
  const panelsCount = Math.round(recommendedKW * 2.5);

  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div className="glass-card flex-col gap-4">
          <h4>Property Details</h4>
          <div className="form-group">
            <label className="label" htmlFor="roofArea">Roof Area (sq ft)</label>
            <input
              type="number"
              id="roofArea"
              className="input"
              value={roofArea}
              onChange={e => setRoofArea(Number(e.target.value) || 0)}
              placeholder="e.g. 1000"
              min="1"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="roofType">Roof Type</label>
            <select id="roofType" className="input select" value={roofType} onChange={e => setRoofType(e.target.value)}>
              <option value="Flat">Flat</option>
              <option value="Sloped">Sloped</option>
              <option value="Terrace">Terrace</option>
              <option value="Metal Sheet">Metal Sheet</option>
              <option value="RCC">RCC</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="buildingAge">Building Age</label>
            <select id="buildingAge" className="input select" value={buildingAge} onChange={e => setBuildingAge(e.target.value)}>
              <option value="0-5 years">0-5 years</option>
              <option value="5-15 years">5-15 years</option>
              <option value="15-30 years">15-30 years</option>
              <option value="30+ years">30+ years</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Shading</label>
            <div className="toggle-group">
              {['None', 'Partial', 'Heavy'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${shading === opt ? 'toggle-option--selected' : ''}`}
                  onClick={() => setShading(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary mt-2 justify-center" onClick={() => setAnalyzed(true)}>
            Analyze Roof Potential
          </button>
        </div>
      </div>

      <div className="flex-col gap-6">
        {analyzed ? (
          <>
            <div className="glass-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="stat-value">{scores.overall}<span className="text-muted" style={{ fontSize: '1.25rem' }}>/100</span></h2>
                  <div className="stat-label">Roof Solar Score</div>
                </div>
                <div className="badge badge--green">EXCELLENT</div>
              </div>

              <div className="score-bar-list mb-6">
                <div className="score-bar-item">
                  <span className="score-bar-label">Solar Resource</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${scores.solarResource}%` }}></div></div>
                  <span className="score-bar-value">{scores.solarResource}</span>
                </div>
                <div className="score-bar-item">
                  <span className="score-bar-label">Roof Suitability</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${scores.roofSuitability}%` }}></div></div>
                  <span className="score-bar-value">{scores.roofSuitability}</span>
                </div>
                <div className="score-bar-item">
                  <span className="score-bar-label">Shading Impact</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${scores.shadingImpact}%` }}></div></div>
                  <span className="score-bar-value">{scores.shadingImpact}</span>
                </div>
                <div className="score-bar-item">
                  <span className="score-bar-label">Structural OK</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${scores.structuralOK}%` }}></div></div>
                  <span className="score-bar-value">{scores.structuralOK}</span>
                </div>
              </div>

              <div className="divider"></div>

              <div>
                <h5 className="mb-1">Recommended Configuration:</h5>
                <div className="text-accent font-semibold" style={{ fontSize: '1.125rem' }}>{recommendedKW} kW System | {panelsCount} × 400W Panels</div>
                <div className="text-sm text-secondary">Shadow-free area: ~{Math.round(roofArea * 0.6)} sq ft usable</div>
              </div>
            </div>

            <div className="glass-card">
              <h4 className="mb-4">Annual Irradiance Heatmap</h4>
              <div className="heatmap-grid">
                <div />
                {MONTHS.map(m => <div key={m} className="heatmap-label justify-center">{m[0]}</div>)}
                {HOURLY_IRRADIANCE_GRID.map((hourData, hour) => (
                  <React.Fragment key={hour}>
                    <div className="heatmap-label">{hour}:00</div>
                    {hourData.map((intensity, month) => (
                      <div
                        key={`${hour}-${month}`}
                        className="heatmap-cell"
                        style={{
                          background: intensity > 0
                            ? `rgba(168, 255, 62, ${intensity})`
                            : 'rgba(255,255,255,0.02)'
                        }}
                        title={`${MONTHS[month]} ${hour}:00 - ${(intensity * 5.5).toFixed(1)} kWh/m²`}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card flex-col items-center justify-center" style={{ minHeight: '300px', textAlign: 'center', opacity: 0.7 }}>
            <Sun size={48} className="mb-4" style={{ color: 'var(--border-active)' }} />
            <p>Fill in the details and click analyze to see your roof's solar potential.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LandSolar: React.FC = () => {
  const [analyzed, setAnalyzed] = useState(false);
  const [landArea, setLandArea] = useState(5);
  const [terrain, setTerrain] = useState('Flat');
  const [soilType, setSoilType] = useState('Sandy');
  const [waterAccess, setWaterAccess] = useState('Yes');
  const [ownership, setOwnership] = useState('Own');

  const estimatedCapacity = Math.round(landArea * 100);
  const annualGeneration = Math.round(estimatedCapacity * 1500);
  const annualRevenue = Math.round(annualGeneration * 6.5 / 100000);

  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div className="glass-card flex-col gap-4">
          <h4>Land Details</h4>
          <div className="form-group">
            <label className="label" htmlFor="landArea">Land Area (acres)</label>
            <input
              type="number"
              id="landArea"
              className="input"
              value={landArea}
              onChange={e => setLandArea(Number(e.target.value) || 0)}
              placeholder="e.g. 5"
              min="0.5"
              step="0.5"
            />
          </div>
          <div className="form-group">
            <label className="label">Terrain</label>
            <div className="toggle-group">
              {['Flat', 'Gently Sloped', 'Hilly'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${terrain === opt ? 'toggle-option--selected' : ''}`}
                  onClick={() => setTerrain(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="soilType">Soil Type</label>
            <select id="soilType" className="input select" value={soilType} onChange={e => setSoilType(e.target.value)}>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Rocky">Rocky</option>
              <option value="Loamy">Loamy</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Water Access</label>
            <div className="toggle-group">
              {['Yes', 'No'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${waterAccess === opt ? 'toggle-option--selected' : ''}`}
                  onClick={() => setWaterAccess(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="ownership">Ownership Type</label>
            <select id="ownership" className="input select" value={ownership} onChange={e => setOwnership(e.target.value)}>
              <option value="Own">Own</option>
              <option value="Lease">Lease</option>
              <option value="Shared">Shared</option>
            </select>
          </div>

          <button className="btn btn-primary mt-2 justify-center" onClick={() => setAnalyzed(true)}>
            Analyze Land Potential
          </button>
        </div>
      </div>

      <div className="flex-col gap-6">
        {analyzed ? (
          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="flex items-center gap-2">
                  <Mountain className="text-accent" /> Land Solar Potential
                </h3>
              </div>
              <div className="badge badge--green">HIGH ✓</div>
            </div>

            <div className="grid-2 gap-6 mb-6">
              <div>
                <div className="stat-label">Estimated Capacity</div>
                <div className="stat-value stat-value--accent" style={{ fontSize: '1.75rem' }}>{estimatedCapacity} kW</div>
                <div className="stat-sublabel">({(estimatedCapacity / 1000).toFixed(1)} MW)</div>
              </div>
              <div>
                <div className="stat-label">Annual Generation</div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>{(annualGeneration / 100000).toFixed(1)}L</div>
                <div className="stat-sublabel">kWh / year</div>
              </div>
            </div>

            <div className="glass-card glass-card--sm glass-card--no-hover mb-6" style={{ background: 'rgba(168, 255, 62, 0.05)' }}>
              <div className="stat-label text-accent">Estimated Annual Revenue</div>
              <div className="text-lg font-bold text-primary">₹{annualRevenue} – {annualRevenue + 8} Lakh</div>
            </div>

            <div className="mb-6">
              <div className="stat-label">Applicable Scheme</div>
              <div className="font-semibold">PM-KUSUM Component A</div>
            </div>

            <button className="btn btn-secondary w-full justify-center">
              Connect with Developers →
            </button>
          </div>
        ) : (
          <div className="glass-card flex-col items-center justify-center" style={{ minHeight: '300px', textAlign: 'center', opacity: 0.7 }}>
            <Mountain size={48} className="mb-4" style={{ color: 'var(--border-active)' }} />
            <p>Fill in your land details to estimate utility-scale or community solar potential.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAssessment;
