import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { DISCOM_BY_STATE } from '../../data/stateElectricityRates';
import { Sparkles, ArrowRight, ArrowLeft, Check, ShieldCheck, Zap, FileText, CheckCircle2 } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setProfile, completeOnboarding } = useApp();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || '',
    userType: userProfile.userType || 'Homeowner',
    propertyType: userProfile.propertyType || 'Independent House',
    roofArea: userProfile.roofArea || 800,
    state: userProfile.state || 'Maharashtra',
    billAmount: userProfile.billAmount || 3200,
    discom: userProfile.discom || 'MSEDCL',
    hasSolar: userProfile.hasSolar ? String(userProfile.hasSolar) : 'No',
    systemSize: userProfile.systemSize || 3.5,
    installYear: userProfile.installYear || 2023,
    wantsBattery: userProfile.wantsBattery ? String(userProfile.wantsBattery) : 'Yes',
    city: userProfile.city || 'Pune',
    pincode: userProfile.pincode || '411001'
  });

  const update = (field: string, val: string | number) => {
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'state') {
        const available = DISCOM_BY_STATE[val as string];
        next.discom = available && available.length > 0 ? available[0] : `${val} State Electricity Board`;
      }
      return next;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1 && !formData.firstName.trim()) {
      newErrors.firstName = 'Name is required';
    }
    if (currentStep === 2) {
      if (!formData.roofArea || Number(formData.roofArea) <= 0) {
        newErrors.roofArea = 'Roof area must be greater than 0';
      }
    }
    if (currentStep === 3) {
      if (!formData.billAmount || Number(formData.billAmount) <= 0) {
        newErrors.billAmount = 'Bill amount must be greater than 0';
      }
    }
    if (currentStep === 5) {
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'PIN code must be 6 digits';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

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

  const monthlyBill = Number(formData.billAmount) || 3200;
  const annualBill = monthlyBill * 12;
  const annualSavings = Math.round(annualBill * 0.85);
  const recommendedKW = (monthlyBill / 1000).toFixed(1);
  const formattedSavings = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(annualSavings);
  const savings25Year = (annualSavings * 25 / 100000).toFixed(1);

  const stepTitles = [
    t('identity') || 'Identity & Role',
    t('property') || 'Property & Roof',
    t('energy') || 'Energy Usage',
    t('solar') || 'Current Solar',
    t('location') || 'Location & DISCOM'
  ];

  return (
    <main className="page flex relative">
      <a href="#onboarding-form" className="skip-link">
        Skip to form
      </a>

      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)',
          borderRadius: '50%'
        }}
      />

      <div className="container flex gap-8 m-auto" style={{ maxWidth: '1200px', padding: '3rem 1.5rem' }}>
        {/* Left Column: Wizard Form */}
        <div id="onboarding-form" className="flex-1 max-w-2xl">
          {/* Header Branding */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '36px',
                height: '36px',
                background: 'rgba(168,255,62,0.12)',
                border: '1px solid rgba(168,255,62,0.3)'
              }}
            >
              <Zap size={20} className="text-accent" />
            </div>
            <span className="font-bold text-primary" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
              Sury<span className="text-accent">X</span>
            </span>
            <span className="badge badge--accent ml-auto">
              Step {currentStep} of 5
            </span>
          </div>

          {/* Progress Dots */}
          <div className="step-progress mb-6">
            {[1, 2, 3, 4, 5].map(step => (
              <React.Fragment key={step}>
                <button
                  type="button"
                  onClick={() => step <= currentStep && setCurrentStep(step)}
                  className={`step-dot ${step === currentStep ? 'step-dot--active' : step < currentStep ? 'step-dot--done' : ''}`}
                  style={{ cursor: step <= currentStep ? 'pointer' : 'default', border: 'none', font: 'inherit' }}
                  aria-label={`Step ${step}: ${stepTitles[step - 1]}`}
                  aria-current={step === currentStep ? 'step' : undefined}
                  disabled={step > currentStep}
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
            <h2 className="mb-1" style={{ fontSize: '1.75rem' }}>
              {currentStep === 1 && "What's your name & role?"}
              {currentStep === 2 && 'Tell us about your property'}
              {currentStep === 3 && 'Average electricity bill'}
              {currentStep === 4 && 'Do you currently have solar?'}
              {currentStep === 5 && 'Confirm location & DISCOM'}
            </h2>
            <p className="text-secondary mb-6" style={{ fontSize: '0.9375rem' }}>
              {currentStep === 1 && 'Personalize your solar intelligence dashboard.'}
              {currentStep === 2 && 'We use roof area to compute maximum KW capacity.'}
              {currentStep === 3 && 'Allows us to model 20-year grid tariff vs solar ROI.'}
              {currentStep === 4 && 'Help us tailor recommendations for storage or expansion.'}
              {currentStep === 5 && 'Calculates accurate DISCOM net-metering & state subsidies.'}
            </p>

            <form onSubmit={handleSubmit}>
              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label" htmlFor="firstName">{t('firstName') || 'First Name'}</label>
                    <input
                      type="text"
                      id="firstName"
                      className="input"
                      value={formData.firstName}
                      onChange={e => update('firstName', e.target.value)}
                      placeholder="e.g. Rahul or Priya"
                      required
                      autoFocus
                    />
                    {errors.firstName && <p className="text-red text-xs">{errors.firstName}</p>}
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
                          <span className="text-sm">{item.label}</span>
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
                    <label className="label" htmlFor="propertyType">{t('propertyType') || 'Property Type'}</label>
                    <select
                      id="propertyType"
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
                    <label className="label" htmlFor="roofArea">{t('propertySize') || 'Approximate Roof / Usable Area (sq ft)'}</label>
                    <input
                      type="number"
                      id="roofArea"
                      className="input"
                      value={formData.roofArea}
                      onChange={e => update('roofArea', e.target.value)}
                      placeholder="e.g. 800"
                      min="1"
                    />
                    {errors.roofArea && <p className="text-red text-xs">{errors.roofArea}</p>}
                    <p className="text-muted text-xs" style={{ marginTop: '4px' }}>
                      Rule of thumb: ~100 sq ft shadow-free area holds 1 kW (~3-4 solar panels).
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="state">{t('yourState') || 'State'}</label>
                    <select
                      id="state"
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
                    <label className="label" htmlFor="billAmount">{t('yourBill') || 'Average Monthly Electricity Bill (₹)'}</label>
                    <div className="relative">
                      <span className="absolute text-accent font-bold" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>₹</span>
                      <input
                        type="number"
                        id="billAmount"
                        className="input"
                        style={{ paddingLeft: '36px', fontSize: '1.125rem', fontWeight: 600 }}
                        value={formData.billAmount}
                        onChange={e => update('billAmount', e.target.value)}
                        placeholder="3200"
                        required
                        min="1"
                      />
                    </div>
                    {errors.billAmount && <p className="text-red text-xs">{errors.billAmount}</p>}
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="discom">DISCOM (Electricity Distribution Company)</label>
                    <select
                      id="discom"
                      className="input select"
                      value={formData.discom}
                      onChange={e => update('discom', e.target.value)}
                    >
                      {(DISCOM_BY_STATE[formData.state] || [`${formData.state} State Electricity Board`]).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="glass-card glass-card--sm" style={{ background: 'rgba(168,255,62,0.04)', borderColor: 'rgba(168,255,62,0.15)' }}>
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-accent" />
                      <div>
                        <p className="text-primary font-semibold text-sm" style={{ margin: 0 }}>Have your physical bill handy?</p>
                        <p className="text-secondary text-xs" style={{ margin: 0 }}>You can scan your bill later using Solar AI OCR Scanner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SOLAR STATUS */}
              {currentStep === 4 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label">{t('existingSolar') || 'Do you currently have solar panels installed?'}</label>
                    <div className="toggle-group">
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          className={`toggle-option ${formData.hasSolar === opt ? 'toggle-option--selected' : ''}`}
                          onClick={() => update('hasSolar', opt)}
                        >
                          {opt === 'Yes' ? '✓ Yes, I have solar' : '✗ No, not yet'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.hasSolar === 'Yes' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="label" htmlFor="systemSize">Current System Size (kW)</label>
                        <input
                          type="number"
                          id="systemSize"
                          className="input"
                          value={formData.systemSize}
                          onChange={e => update('systemSize', e.target.value)}
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                      <div className="form-group">
                        <label className="label" htmlFor="installYear">Installation Year</label>
                        <input
                          type="number"
                          id="installYear"
                          className="input"
                          value={formData.installYear}
                          onChange={e => update('installYear', e.target.value)}
                          min="2000"
                          max="2030"
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="label">Are you interested in battery storage?</label>
                    <div className="toggle-group">
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
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label" htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        className="input"
                        value={formData.city}
                        onChange={e => update('city', e.target.value)}
                        placeholder="e.g. Pune"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="pincode">PIN Code</label>
                      <input
                        type="text"
                        id="pincode"
                        className="input"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={e => update('pincode', e.target.value)}
                        placeholder="411001"
                      />
                      {errors.pincode && <p className="text-red text-xs">{errors.pincode}</p>}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="glass-card glass-card--sm" style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="text-green" size={24} />
                      <div>
                        <h4 className="text-primary font-semibold" style={{ margin: 0 }}>Ready to Generate Solar Intelligence</h4>
                        <p className="text-secondary text-xs" style={{ margin: 0 }}>DISCOM: {formData.discom}</p>
                      </div>
                    </div>

                    <div className="grid-2 gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                      <div><span className="text-muted">Name:</span> <strong className="text-primary">{formData.firstName || 'User'}</strong></div>
                      <div><span className="text-muted">State:</span> <strong className="text-primary">{formData.state}</strong></div>
                      <div><span className="text-muted">Monthly Bill:</span> <strong className="text-accent">₹{formData.billAmount}</strong></div>
                      <div><span className="text-muted">Roof Area:</span> <strong className="text-primary">{formData.roofArea} sq ft</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex justify-between gap-4 mt-8">
                {currentStep > 1 ? (
                  <button type="button" className="btn btn-ghost" onClick={handlePrev}>
                    <ArrowLeft size={16} /> {t('back') || 'Back'}
                  </button>
                ) : <div />}

                {currentStep < 5 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    {t('next') || 'Next Step'} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-lg flex-1 justify-center">
                    View My Solar Dashboard ☀️
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Savings & ROI Preview Card */}
        <div className="onboarding-preview-col flex-col gap-6" style={{ width: '420px' }}>
          <div
            className="glass-card text-center"
            style={{
              background: 'linear-gradient(165deg, rgba(13,26,16,0.9) 0%, rgba(168,255,62,0.08) 100%)',
              borderColor: 'rgba(168,255,62,0.2)',
              padding: '2.5rem 2rem'
            }}
          >
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-4"
              style={{
                width: '64px',
                height: '64px',
                background: 'rgba(168,255,62,0.12)',
                border: '1px solid rgba(168,255,62,0.3)'
              }}
            >
              <Sparkles size={32} className="text-accent" />
            </div>

            <p className="stat-label text-xs letter-wide">Est. 25-Year Cumulative Savings</p>
            <div className="stat-value stat-value--accent mb-1" style={{ fontSize: '2.75rem' }}>
              ₹{savings25Year} Lakh
            </div>
            <p className="stat-sublabel text-secondary">
              ~₹{formattedSavings} / year based on your ₹{monthlyBill.toLocaleString('en-IN')} bill
            </p>

            <div className="divider" />

            <div className="grid-2 gap-4 text-left">
              <div>
                <span className="stat-label">System Size</span>
                <p className="text-lg font-bold text-primary" style={{ margin: 0 }}>~{recommendedKW} kW</p>
              </div>
              <div>
                <span className="stat-label">PM Subsidy</span>
                <p className="text-lg font-bold text-amber" style={{ margin: 0 }}>₹78,000</p>
              </div>
            </div>
          </div>

          {/* Quick Info card */}
          <div className="glass-card glass-card--sm flex items-center gap-4">
            <ShieldCheck size={28} className="text-green shrink-0" />
            <div>
              <p className="text-primary font-semibold text-sm" style={{ margin: 0 }}>PM Surya Ghar Muft Bijli Yojana</p>
              <p className="text-muted text-xs" style={{ margin: 0 }}>Up to ₹78,000 direct bank subsidy for residential rooftop solar.</p>
            </div>
          </div>

          {/* Mobile: Show preview toggle */}
          <button
            type="button"
            className="btn btn-secondary w-full justify-center onboarding-mobile-toggle"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            aria-expanded={showMobilePreview}
          >
            {showMobilePreview ? 'Hide' : 'Show'} Savings Preview
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .onboarding-preview-col { display: none !important; }
          .onboarding-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 993px) {
          .onboarding-mobile-toggle { display: none !important; }
        }
      `}</style>
    </main>
  );
};

export default Onboarding;
