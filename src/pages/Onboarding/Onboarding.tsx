import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, ArrowLeft, Check, ShieldCheck, Zap, Building2, Home, MapPin, FileText, CheckCircle2 } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const DISCOM_MAP: Record<string, string[]> = {
  'Maharashtra': ['MSEDCL (Mahavitaran)', 'BEST Undertaking', 'Tata Power Mumbai', 'Adani Electricity'],
  'Gujarat': ['DGVCL (South)', 'MGVCL (Central)', 'PGVCL (West)', 'UGVCL (North)', 'Torrent Power'],
  'Karnataka': ['BESCOM (Bengaluru)', 'HESCOM (Hubli)', 'GESCOM (Gulbarga)', 'MESCOM (Mangalore)', 'CESC (Mysore)'],
  'Delhi': ['BSES Rajdhani (BRPL)', 'BSES Yamuna (BYPL)', 'Tata Power DDL (TPDDL)', 'NDMC'],
  'Tamil Nadu': ['TANGEDCO (Chennai North)', 'TANGEDCO (Chennai South)', 'TANGEDCO (Coimbatore)'],
  'Uttar Pradesh': ['DVVNL (Agra)', 'MVVNL (Lucknow)', 'PVVNL (Meerut)', 'PuVVNL (Varanasi)', 'KESCO (Kanpur)'],
  'Rajasthan': ['JVVNL (Jaipur)', 'JdVVNL (Jodhpur)', 'AVVNL (Ajmer)'],
  'West Bengal': ['WBSEDCL', 'CESC Kolkata'],
  'Telangana': ['TSSPDCL (Hyderabad)', 'TSNPDCL (Warangal)'],
  'Andhra Pradesh': ['APEPDCL (Visakhapatnam)', 'APSPDCL (Tirupati)', 'APCPDCL (Vijayawada)'],
  'Punjab': ['PSPCL (Punjab State Power)'],
  'Haryana': ['UHBVN (Panchkula)', 'DHBVN (Hisar)'],
  'Kerala': ['KSEB (Kerala State Electricity Board)'],
  'Madhya Pradesh': ['MPPKVVCL (Jabalpur)', 'MPWZ (Indore)', 'MPMKVVCL (Bhopal)'],
  'Bihar': ['NBPDCL (North Bihar)', 'SBPDCL (South Bihar)']
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setProfile, completeOnboarding, userRole } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || userProfile.name || '',
    userType: userProfile.userType || userProfile.occupation || 'Homeowner',
    propertyType: userProfile.propertyType || 'Independent House',
    roofArea: userProfile.roofArea || userProfile.roofSqFt || 800,
    state: userProfile.state || 'Maharashtra',
    billAmount: userProfile.billAmount || userProfile.avgBill || 3200,
    discom: userProfile.discom || 'MSEDCL (Mahavitaran)',
    hasSolar: userProfile.hasSolar ? String(userProfile.hasSolar) : 'No',
    systemSize: userProfile.systemSize || 3.5,
    installYear: userProfile.installYear || 2023,
    wantsBattery: userProfile.wantsBattery ? String(userProfile.wantsBattery) : 'Yes',
    city: userProfile.city || 'Pune',
    pincode: userProfile.pincode || userProfile.pinCode || '411001'
  });

  const update = (field: string, val: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'state') {
        const available = DISCOM_MAP[val];
        if (available && available.length > 0) {
          next.discom = available[0];
        } else {
          next.discom = `${val} State Electricity Board`;
        }
      }
      return next;
    });
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Save to AppContext & localStorage
    setProfile({
      firstName: formData.firstName || 'User',
      name: formData.firstName || 'User',
      userType: formData.userType,
      occupation: formData.userType,
      propertyType: formData.propertyType,
      roofArea: Number(formData.roofArea) || 800,
      roofSqFt: Number(formData.roofArea) || 800,
      state: formData.state,
      discom: formData.discom,
      billAmount: Number(formData.billAmount) || 3200,
      avgBill: Number(formData.billAmount) || 3200,
      hasSolar: formData.hasSolar === 'Yes',
      systemSize: Number(formData.systemSize) || 3.5,
      installYear: Number(formData.installYear) || 2023,
      wantsBattery: formData.wantsBattery === 'Yes',
      city: formData.city || 'City',
      pinCode: formData.pincode || '411001',
      pincode: formData.pincode || '411001'
    });

    completeOnboarding();
    navigate('/dashboard');
  };

  // Real-time Savings Preview Calculation
  const monthlyBill = Number(formData.billAmount) || 3200;
  const annualBill = monthlyBill * 12;
  const annualSavings = Math.round(annualBill * 0.85); // 85% offset
  const recommendedKW = (monthlyBill / 1000).toFixed(1);
  const formattedSavings = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(annualSavings);

  const stepTitles = [
    "Identity & Role",
    "Property & Roof",
    "Energy Usage",
    "Current Solar",
    "Location & DISCOM"
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)', position: 'relative' }}>
      
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      <div className="container" style={{ display: 'flex', gap: '3rem', margin: 'auto', padding: '3rem 1.5rem', maxWidth: '1200px' }}>
        
        {/* Left Column: Wizard Form */}
        <div style={{ flex: 1, maxWidth: '640px' }}>
          
          {/* Header Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(168,255,62,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,255,62,0.3)'
            }}>
              <Zap size={20} color="#A8FF3E" />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#F0FFF4' }}>
              Sury<span style={{ color: '#A8FF3E' }}>X</span>
            </span>
            <span className="badge badge--accent" style={{ marginLeft: 'auto' }}>
              Step {currentStep} of 5
            </span>
          </div>

          {/* Progress Dots */}
          <div className="step-progress" style={{ marginBottom: '2.5rem' }}>
            {[1, 2, 3, 4, 5].map(step => (
              <React.Fragment key={step}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step)}
                  className={`step-dot ${step === currentStep ? 'step-dot--active' : step < currentStep ? 'step-dot--done' : ''}`}
                  style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
                >
                  {step < currentStep ? <Check size={16} /> : step}
                </button>
                {step < 5 && (
                  <div className={`step-line ${step < currentStep ? 'step-line--done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Form Box */}
          <div className="glass-card glass-card--lg" style={{ boxShadow: 'var(--shadow-glow)' }}>
            
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', marginBottom: '0.5rem', color: '#F0FFF4' }}>
              {currentStep === 1 && "What's your name & role?"}
              {currentStep === 2 && "Tell us about your property"}
              {currentStep === 3 && "Average electricity bill"}
              {currentStep === 4 && "Do you currently have solar?"}
              {currentStep === 5 && "Confirm location & DISCOM"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
              {currentStep === 1 && "Personalize your solar intelligence dashboard."}
              {currentStep === 2 && "We use roof area to compute maximum KW capacity."}
              {currentStep === 3 && "Allows us to model 20-year grid tariff vs solar ROI."}
              {currentStep === 4 && "Help us tailor recommendations for storage or expansion."}
              {currentStep === 5 && "Calculates accurate DISCOM net-metering & state subsidies."}
            </p>

            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label">First Name</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={formData.firstName} 
                      onChange={e => update('firstName', e.target.value)}
                      placeholder="e.g. Rahul or Priya"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">I am a...</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      {[
                        { label: 'Homeowner', icon: '🏠' },
                        { label: 'Tenant', icon: '🔑' },
                        { label: 'Business Owner', icon: '🏢' }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          className={`toggle-option ${formData.userType === item.label ? 'toggle-option--selected' : ''}`}
                          onClick={() => update('userType', item.label)}
                          style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                          <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROPERTY */}
              {currentStep === 2 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label">Property Type</label>
                    <select 
                      className="input select" 
                      value={formData.propertyType} 
                      onChange={e => update('propertyType', e.target.value)}
                    >
                      <option value="Independent House">Independent House / Row House</option>
                      <option value="Flat/Apartment">Flat / Apartment Complex</option>
                      <option value="Villa">Villa / Bungalow</option>
                      <option value="Agricultural Land">Agricultural / Unused Land</option>
                      <option value="Commercial">Commercial / Industrial Building</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">Approximate Roof / Usable Area (sq ft)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={formData.roofArea} 
                      onChange={e => update('roofArea', e.target.value)}
                      placeholder="e.g. 800"
                    />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
                      💡 Rule of thumb: ~100 sq ft shadow-free area holds 1 kW (~3-4 solar panels).
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="label">State</label>
                    <select 
                      className="input select" 
                      value={formData.state} 
                      onChange={e => update('state', e.target.value)}
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: ELECTRICITY BILL */}
              {currentStep === 3 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label">Average Monthly Electricity Bill (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.1rem' }}>₹</span>
                      <input 
                        type="number" 
                        className="input" 
                        style={{ paddingLeft: '36px', fontSize: '1.125rem', fontWeight: 600 }}
                        value={formData.billAmount} 
                        onChange={e => update('billAmount', e.target.value)}
                        placeholder="3200"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">DISCOM (Electricity Distribution Company)</label>
                    <select 
                      className="input select" 
                      value={formData.discom} 
                      onChange={e => update('discom', e.target.value)}
                    >
                      {(DISCOM_MAP[formData.state] || [`${formData.state} State Electricity Board`]).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="glass-card glass-card--sm" style={{ background: 'rgba(168,255,62,0.04)', borderColor: 'rgba(168,255,62,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={20} color="var(--accent-primary)" />
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>Have your physical bill handy?</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>You can scan your bill later using Solar AI OCR Scanner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SOLAR STATUS */}
              {currentStep === 4 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label">Do you currently have solar panels installed?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          className={`toggle-option ${formData.hasSolar === opt ? 'toggle-option--selected' : ''}`}
                          style={{ padding: '1rem', fontSize: '1.1rem' }}
                          onClick={() => update('hasSolar', opt)}
                        >
                          {opt === 'Yes' ? '✓ Yes, I have solar' : '✗ No, not yet'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.hasSolar === 'Yes' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="label">Current System Size (kW)</label>
                        <input 
                          type="number" 
                          className="input" 
                          value={formData.systemSize} 
                          onChange={e => update('systemSize', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Installation Year</label>
                        <input 
                          type="number" 
                          className="input" 
                          value={formData.installYear} 
                          onChange={e => update('installYear', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="label">Are you interested in battery storage?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          className={`toggle-option ${formData.wantsBattery === opt ? 'toggle-option--selected' : ''}`}
                          onClick={() => update('wantsBattery', opt)}
                        >
                          {opt === 'Yes' ? 'Yes, battery storage' : 'No, grid-tied only'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: LOCATION & DISCOM CONFIRMATION */}
              {currentStep === 5 && (
                <div className="flex-col gap-6">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="label">City</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={formData.city} 
                        onChange={e => update('city', e.target.value)}
                        placeholder="e.g. Pune"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">PIN Code</label>
                      <input 
                        type="text" 
                        className="input" 
                        maxLength={6}
                        value={formData.pincode} 
                        onChange={e => update('pincode', e.target.value)}
                        placeholder="411001"
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="glass-card glass-card--sm" style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <CheckCircle2 color="#4ADE80" size={24} />
                      <div>
                        <h4 style={{ color: '#F0FFF4', fontSize: '1rem', margin: 0 }}>Ready to Generate Solar Intelligence</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>DISCOM: {formData.discom}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong style={{ color: '#F0FFF4' }}>{formData.firstName || 'User'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>State:</span> <strong style={{ color: '#F0FFF4' }}>{formData.state}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Monthly Bill:</span> <strong style={{ color: '#A8FF3E' }}>₹{formData.billAmount}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Roof Area:</span> <strong style={{ color: '#F0FFF4' }}>{formData.roofArea} sq ft</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2.5rem' }}>
                {currentStep > 1 ? (
                  <button type="button" className="btn btn-ghost" onClick={handlePrev}>
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div />}

                {currentStep < 5 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Next Step <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                    View My Solar Dashboard ☀️
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Live Savings & ROI Preview Card */}
        <div style={{ width: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="onboarding-preview-col">
          <div className="glass-card" style={{
            background: 'linear-gradient(165deg, rgba(13,26,16,0.9) 0%, rgba(168,255,62,0.08) 100%)',
            borderColor: 'rgba(168,255,62,0.2)',
            padding: '2.5rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168,255,62,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              border: '1px solid rgba(168,255,62,0.3)'
            }}>
              <Sparkles size={32} color="#A8FF3E" />
            </div>

            <p className="stat-label" style={{ fontSize: '0.8125rem', letterSpacing: '0.08em' }}>Est. 25-Year Cumulative Savings</p>
            <div className="stat-value stat-value--accent" style={{ fontSize: '2.75rem', margin: '0.5rem 0' }}>
              ₹{(annualSavings * 20 / 100000).toFixed(1)} Lakh
            </div>
            <p className="stat-sublabel" style={{ color: 'var(--text-secondary)' }}>
              ~₹{formattedSavings} / year based on your ₹{monthlyBill.toLocaleString('en-IN')} bill
            </p>

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.5rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
              <div>
                <span className="stat-label">System Size</span>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0FFF4', margin: 0 }}>~{recommendedKW} kW</p>
              </div>
              <div>
                <span className="stat-label">PM Subsidy</span>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F59E0B', margin: 0 }}>₹78,000</p>
              </div>
            </div>
          </div>

          {/* Quick Info card */}
          <div className="glass-card glass-card--sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheck size={28} color="#22C55E" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ color: '#F0FFF4', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>PM Surya Ghar Muft Bijli Yojana</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78125rem', margin: 0 }}>Up to ₹78,000 direct bank subsidy for residential rooftop solar.</p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .onboarding-preview-col { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
