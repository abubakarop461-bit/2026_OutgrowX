import React, { useState } from 'react';
import { ShieldCheck, Sun, Mountain, Building, CheckCircle2, XCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const PropertyAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roof' | 'land'>('roof');

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
        <h1>Property Assessment</h1>
        <p>Analyze your property's potential for solar energy generation.</p>
      </header>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        <button 
          className={`tab-btn ${activeTab === 'roof' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('roof')}
        >
          Roof Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'land' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('land')}
        >
          Land Solar
        </button>
      </div>

      {activeTab === 'roof' && <RoofAnalysis />}
      {activeTab === 'land' && <LandSolar />}

      <div className="glass-card" style={{ marginTop: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck color="var(--accent-primary)" /> Government Eligibility
        </h3>
        <div className="flex-col gap-3">
          <div className="glass-card glass-card--sm glass-card--no-hover flex items-center gap-3">
            <CheckCircle2 color="var(--accent-green)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>PM Surya Ghar: Muft Bijli Yojana</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>₹78,000 eligible based on recommended capacity.</div>
            </div>
            <button className="btn btn-secondary btn-sm">Apply</button>
          </div>
          <div className="glass-card glass-card--sm glass-card--no-hover flex items-center gap-3">
            <CheckCircle2 color="var(--accent-green)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>State DISCOM Net Metering</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Applicable for residential properties.</div>
            </div>
            <button className="btn btn-secondary btn-sm">Details</button>
          </div>
          <div className="glass-card glass-card--sm glass-card--no-hover flex items-center gap-3" style={{ opacity: 0.6 }}>
            <XCircle color="var(--accent-red)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>PM-KUSUM</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Land size &lt; minimum requirement.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoofAnalysis: React.FC = () => {
  const [analyzed, setAnalyzed] = useState(false);
  
  const barData = {
    labels: ['Solar Resource', 'Roof Suitability', 'Shading Impact', 'Structural OK'],
    datasets: [{
      label: 'Score / 100',
      data: [94, 85, 88, 90],
      backgroundColor: 'rgba(168, 255, 62, 0.8)',
      borderRadius: 4
    }]
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div className="glass-card flex-col gap-4">
          <h4>Property Details</h4>
          <div className="form-group">
            <label className="label">Roof Area (sq ft)</label>
            <input type="number" className="input" placeholder="e.g. 1000" />
          </div>
          <div className="form-group">
            <label className="label">Roof Type</label>
            <select className="input select">
              <option>Flat</option>
              <option>Sloped</option>
              <option>Terrace</option>
              <option>Metal Sheet</option>
              <option>RCC</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Building Age</label>
            <select className="input select">
              <option>0-5 years</option>
              <option>5-15 years</option>
              <option>15-30 years</option>
              <option>30+ years</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Shading</label>
            <div className="toggle-group">
              <button className="toggle-option toggle-option--selected">None</button>
              <button className="toggle-option">Partial</button>
              <button className="toggle-option">Heavy</button>
            </div>
          </div>
          
          <button className="btn btn-primary" style={{ marginTop: 'var(--space-2)', justifyContent: 'center' }} onClick={() => setAnalyzed(true)}>
            Analyze Roof Potential
          </button>
        </div>
      </div>

      <div className="flex-col gap-6">
        {analyzed ? (
          <>
            <div className="glass-card">
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 className="stat-value">87<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/100</span></h2>
                  <div className="stat-label">Roof Solar Score</div>
                </div>
                <div className="badge badge--green">EXCELLENT</div>
              </div>

              <div className="score-bar-list" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="score-bar-item">
                  <span className="score-bar-label">Solar Resource</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: '94%' }}></div></div>
                  <span className="score-bar-value">94</span>
                </div>
                <div className="score-bar-item">
                  <span className="score-bar-label">Roof Suitability</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: '85%' }}></div></div>
                  <span className="score-bar-value">85</span>
                </div>
                <div className="score-bar-item">
                  <span className="score-bar-label">Shading Impact</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: '88%' }}></div></div>
                  <span className="score-bar-value">88</span>
                </div>
                <div className="score-bar-item">
                  <span className="score-bar-label">Structural OK</span>
                  <div className="score-bar-track"><div className="score-bar-fill" style={{ width: '90%' }}></div></div>
                  <span className="score-bar-value">90</span>
                </div>
              </div>

              <div className="divider"></div>
              
              <div>
                <h5 style={{ marginBottom: 'var(--space-2)' }}>Recommended Configuration:</h5>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '1.125rem' }}>4 kW System | 10 × 400W Panels</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Shadow-free area: ~300 sq ft usable</div>
              </div>
            </div>

            <div className="glass-card">
              <h4 style={{ marginBottom: 'var(--space-4)' }}>Annual Irradiance Heatmap</h4>
              <div className="heatmap-grid">
                <div />
                {months.map(m => <div key={m} className="heatmap-label" style={{ justifyContent: 'center' }}>{m[0]}</div>)}
                {[...Array(24)].map((_, hour) => (
                  <React.Fragment key={hour}>
                    <div className="heatmap-label">{hour}:00</div>
                    {[...Array(12)].map((_, month) => {
                      const isDaylight = hour > 6 && hour < 18;
                      const isSummer = month > 2 && month < 9;
                      const intensity = isDaylight ? (isSummer ? Math.random() * 0.5 + 0.5 : Math.random() * 0.4 + 0.2) : 0;
                      return (
                        <div 
                          key={`${hour}-${month}`} 
                          className="heatmap-cell" 
                          style={{ 
                            background: intensity > 0 
                              ? `rgba(168, 255, 62, ${intensity})` 
                              : 'rgba(255,255,255,0.02)' 
                          }} 
                          title={`${intensity.toFixed(2)} kWh/m²`}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card flex-col items-center justify-center" style={{ height: '100%', minHeight: '300px', textAlign: 'center', opacity: 0.7 }}>
            <Sun size={48} color="var(--border-active)" style={{ marginBottom: 'var(--space-4)' }} />
            <p>Fill in the details and click analyze to see your roof's solar potential.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LandSolar: React.FC = () => {
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <div className="grid-2">
      <div className="flex-col gap-6">
        <div className="glass-card flex-col gap-4">
          <h4>Land Details</h4>
          <div className="form-group">
            <label className="label">Land Area (acres)</label>
            <input type="number" className="input" placeholder="e.g. 5" />
          </div>
          <div className="form-group">
            <label className="label">Terrain</label>
            <div className="toggle-group">
              <button className="toggle-option toggle-option--selected">Flat</button>
              <button className="toggle-option">Gently Sloped</button>
              <button className="toggle-option">Hilly</button>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Soil Type</label>
            <select className="input select">
              <option>Sandy</option>
              <option>Clay</option>
              <option>Rocky</option>
              <option>Loamy</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Water Access</label>
            <div className="toggle-group">
              <button className="toggle-option toggle-option--selected">Yes</button>
              <button className="toggle-option">No</button>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Ownership Type</label>
            <select className="input select">
              <option>Own</option>
              <option>Lease</option>
              <option>Shared</option>
            </select>
          </div>
          
          <button className="btn btn-primary" style={{ marginTop: 'var(--space-2)', justifyContent: 'center' }} onClick={() => setAnalyzed(true)}>
            Analyze Land Potential
          </button>
        </div>
      </div>

      <div className="flex-col gap-6">
        {analyzed ? (
          <div className="glass-card">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mountain color="var(--accent-primary)" /> Land Solar Potential
                </h3>
              </div>
              <div className="badge badge--green">HIGH ✓</div>
            </div>

            <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
              <div>
                <div className="stat-label">Estimated Capacity</div>
                <div className="stat-value stat-value--accent" style={{ fontSize: '1.75rem' }}>500 kW</div>
                <div className="stat-sublabel">(0.5 MW)</div>
              </div>
              <div>
                <div className="stat-label">Annual Generation</div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>7.5L</div>
                <div className="stat-sublabel">kWh / year</div>
              </div>
            </div>

            <div className="glass-card glass-card--sm glass-card--no-hover" style={{ marginBottom: 'var(--space-6)', background: 'rgba(168, 255, 62, 0.05)' }}>
              <div className="stat-label" style={{ color: 'var(--accent-primary)' }}>Estimated Annual Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹2.2 – 3.0 Lakh</div>
            </div>
            
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="stat-label">Applicable Scheme</div>
              <div style={{ fontWeight: 600 }}>PM-KUSUM Component A</div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Connect with Developers →
            </button>
          </div>
        ) : (
          <div className="glass-card flex-col items-center justify-center" style={{ height: '100%', minHeight: '300px', textAlign: 'center', opacity: 0.7 }}>
            <Mountain size={48} color="var(--border-active)" style={{ marginBottom: 'var(--space-4)' }} />
            <p>Fill in your land details to estimate utility-scale or community solar potential.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAssessment;

