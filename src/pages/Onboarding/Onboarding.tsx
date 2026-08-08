import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { DISCOM_BY_STATE } from '../../data/stateElectricityRates';
import {
  House, Plant, Key, Buildings, Sparkle, ArrowRight, ArrowLeft,
  Check, ShieldCheck, Lightning, CurrencyInr, CheckCircle,
  IdentificationCard, MapPin, Briefcase
} from '@phosphor-icons/react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, setProfile, completeOnboarding } = useApp();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Initialize form state
  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    userType: userRole === 'business' ? 'Solar Vendor' : userRole === 'landowner' ? 'Landowner' : 'Homeowner',
    propertyType: userRole === 'landowner' ? 'Agricultural Land' : 'Independent House',
    roofArea: '',
    state: '',
    billAmount: '',
    discom: '',
    hasSolar: 'No',
    systemSize: '',
    installYear: '',
    wantsBattery: 'Yes',
    city: '',
    pincode: '',
    // Business specific fields
    gstin: '',
    licenseNo: '',
    businessType: 'EPC Installer',
    phone: '',
    email: ''
  });

  const isBusiness = formData.userType === 'Business Owner' || formData.userType === 'Solar Vendor';

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

    if (isBusiness) {
      // Business Validation Flow
      if (currentStep === 1) {
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'Contact person name is required';
      }
      if (currentStep === 2) {
        if (!formData.gstin.trim()) newErrors.gstin = 'GSTIN is required for business verification';
        if (!formData.licenseNo.trim()) newErrors.licenseNo = 'DISCOM empanelment license is required';
      }
      if (currentStep === 3) {
        if (!formData.state) newErrors.state = 'Primary operating state is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
      }
      if (currentStep === 5) {
        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
          newErrors.pincode = 'PIN code must be 6 digits';
        }
      }
    } else {
      // Residential Consumer Validation Flow
      if (currentStep === 1 && !formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (currentStep === 2 && (!formData.roofArea || Number(formData.roofArea) <= 0)) {
        newErrors.roofArea = 'Roof area must be greater than 0';
      }
      if (currentStep === 3 && (!formData.billAmount || Number(formData.billAmount) <= 0)) {
        newErrors.billAmount = 'Bill amount must be greater than 0';
      }
      if (currentStep === 5 && formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
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

    if (isBusiness) {
      setProfile({
        firstName: formData.firstName || 'Business Partner',
        name: formData.companyName || formData.firstName || 'Business Partner',
        companyName: formData.companyName,
        userType: 'Business Owner',
        occupation: 'Business Owner',
        propertyType: 'Commercial',
        roofArea: 2000,
        roofSqFt: 2000,
        state: formData.state || 'Maharashtra',
        discom: formData.discom || 'MSEDCL',
        billAmount: 15000,
        avgBill: 15000,
        hasSolar: true,
        gstin: formData.gstin,
        licenseNo: formData.licenseNo,
        businessType: formData.businessType,
        city: formData.city || 'City',
        pincode: formData.pincode || '411001'
      });
      completeOnboarding();
      navigate('/marketplace');
    } else {
      setProfile({
        firstName: formData.firstName || 'User',
        name: formData.firstName || 'User',
        userType: formData.userType,
        occupation: formData.userType,
        propertyType: formData.propertyType,
        roofArea: Number(formData.roofArea) || 800,
        roofSqFt: Number(formData.roofArea) || 800,
        state: formData.state || 'Maharashtra',
        discom: formData.discom || 'MSEDCL',
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
    }
  };

  // Live consumer calculations
  const hasBillData = Number(formData.billAmount) > 0;
  const monthlyBill = Number(formData.billAmount) || 0;
  const annualBill = monthlyBill * 12;
  const annualSavings = Math.round(annualBill * 0.85);
  const recommendedKW = monthlyBill > 0 ? (monthlyBill / 1000).toFixed(1) : '—';
  const formattedSavings = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(annualSavings);
  const savings25Year = (annualSavings * 25 / 100000).toFixed(1);

  const stepTitles = isBusiness
    ? ['Company Info', 'DISCOM License', 'Operating State', 'Services Offered', 'Verification']
    : [
        t('identity') || 'Identity & Role',
        t('property') || 'Property & Roof',
        t('energy') || 'Energy Usage',
        t('solar') || 'Current Solar',
        t('location') || 'Location & DISCOM'
      ];

  return (
    <main className="page flex relative">
      <a href="#onboarding-form" className="skip-link">Skip to form</a>

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
          background: 'radial-gradient(circle, rgba(168,255,62,0.05) 0%, transparent 70%)',
          borderRadius: '50%'
        }}
      />

      <div className="container flex gap-8 m-auto" style={{ maxWidth: '1200px', padding: '3rem 1.5rem' }}>
        {/* Left Column: Wizard Form */}
        <div id="onboarding-form" className="flex-1 max-w-2xl">
          {/* Header Branding */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="SuryaSetu Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 10px rgba(255,183,3,0.35))'
              }}
            />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#ECF2EE' }}>
              Surya<span style={{ color: '#A8FF3E' }}>Setu</span>
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
                  {step < currentStep ? <Check size={16} weight="bold" /> : step}
                </button>
                {step < 5 && (
                  <div className={`step-line ${step < currentStep ? 'step-line--done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Form Box */}
          <div className="glass-card glass-card--lg" style={{ boxShadow: 'var(--shadow-glow)' }}>
            <h2 className="mb-1" style={{ fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', color: '#ECF2EE' }}>
              {isBusiness ? (
                <>
                  {currentStep === 1 && 'Solar Company & Contact Person'}
                  {currentStep === 2 && 'DISCOM License & GSTIN Registration'}
                  {currentStep === 3 && 'Primary Operating State & City'}
                  {currentStep === 4 && 'Services & Specialization'}
                  {currentStep === 5 && 'Confirm Business Verification'}
                </>
              ) : (
                <>
                  {currentStep === 1 && "What's your name & role?"}
                  {currentStep === 2 && 'Tell us about your property'}
                  {currentStep === 3 && 'Average electricity bill'}
                  {currentStep === 4 && 'Do you currently have solar?'}
                  {currentStep === 5 && 'Confirm location & DISCOM'}
                </>
              )}
            </h2>
            <p className="text-secondary mb-6" style={{ fontSize: '0.875rem', color: '#7A9484' }}>
              {isBusiness ? (
                <>
                  {currentStep === 1 && 'Register your solar business to receive verified PM Surya Ghar consumer leads.'}
                  {currentStep === 2 && 'We verify GSTIN & state DISCOM empanelment to ensure installer authenticity.'}
                  {currentStep === 3 && 'Filters incoming customer leads to your active installation territories.'}
                  {currentStep === 4 && 'Match your company with residential rooftop, KUSUM, or commercial projects.'}
                  {currentStep === 5 && 'Finalize installer profile and launch your marketplace dashboard.'}
                </>
              ) : (
                <>
                  {currentStep === 1 && 'Personalize your solar intelligence dashboard.'}
                  {currentStep === 2 && 'We use roof area to compute maximum kW capacity.'}
                  {currentStep === 3 && 'Allows us to model 20-year grid tariff vs solar ROI.'}
                  {currentStep === 4 && 'Help us tailor recommendations for storage or expansion.'}
                  {currentStep === 5 && 'Calculates accurate DISCOM net-metering & state subsidies.'}
                </>
              )}
            </p>

            <form onSubmit={handleSubmit}>
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="flex-col gap-6">
                  {/* Role Selector Toggle */}
                  <div className="form-group">
                    <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>I am a...</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      {[
                        { label: 'Homeowner', Icon: House, color: '#A8FF3E', role: 'consumer' },
                        { label: 'Landowner', Icon: Plant, color: '#60A5FA', role: 'landowner' },
                        { label: 'Solar Vendor', Icon: Buildings, color: '#F59E0B', role: 'business' }
                      ].map(({ label, Icon, color, role }) => (
                        <button
                          key={label}
                          type="button"
                          className={`toggle-option ${formData.userType === label || (label === 'Solar Vendor' && formData.userType === 'Business Owner') ? 'toggle-option--selected' : ''}`}
                          onClick={() => {
                            const targetType = label === 'Solar Vendor' ? 'Solar Vendor' : label;
                            update('userType', targetType);
                            if (label === 'Landowner') update('propertyType', 'Agricultural Land');
                            if (label === 'Homeowner') update('propertyType', 'Independent House');
                          }}
                          style={{ padding: '1.25rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}
                        >
                          <Icon size={26} weight="duotone" color={(formData.userType === label || (label === 'Solar Vendor' && formData.userType === 'Business Owner')) ? '#A8FF3E' : color} />
                          <span className="text-sm" style={{ fontWeight: 600 }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {isBusiness ? (
                    <>
                      <div className="form-group">
                        <label className="label" htmlFor="companyName" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Company Legal Name</label>
                        <input
                          type="text"
                          id="companyName"
                          className="input"
                          value={formData.companyName}
                          onChange={e => update('companyName', e.target.value)}
                          placeholder="e.g. Solarix Power India Pvt Ltd"
                          required
                          autoFocus
                          style={{ fontSize: '0.875rem' }}
                        />
                        {errors.companyName && <p className="text-red text-xs">{errors.companyName}</p>}
                      </div>
                      <div className="form-group">
                        <label className="label" htmlFor="firstName" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Contact Person Name</label>
                        <input
                          type="text"
                          id="firstName"
                          className="input"
                          value={formData.firstName}
                          onChange={e => update('firstName', e.target.value)}
                          placeholder="e.g. Vikram Sharma (Director / Manager)"
                          required
                          style={{ fontSize: '0.875rem' }}
                        />
                        {errors.firstName && <p className="text-red text-xs">{errors.firstName}</p>}
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label className="label" htmlFor="firstName" style={{ fontSize: '0.75rem', color: '#7A9484' }}>First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        className="input"
                        value={formData.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        required
                        autoFocus
                        style={{ fontSize: '0.875rem' }}
                      />
                      {errors.firstName && <p className="text-red text-xs">{errors.firstName}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="flex-col gap-6">
                  {isBusiness ? (
                    <>
                      <div className="form-group">
                        <label className="label" htmlFor="gstin" style={{ fontSize: '0.75rem', color: '#7A9484' }}>GSTIN (Goods &amp; Services Tax ID)</label>
                        <input
                          type="text"
                          id="gstin"
                          className="input"
                          value={formData.gstin}
                          onChange={e => update('gstin', e.target.value.toUpperCase())}
                          placeholder="e.g. 27AAAAA0000A1Z5"
                          required
                          maxLength={15}
                          style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}
                        />
                        {errors.gstin && <p className="text-red text-xs">{errors.gstin}</p>}
                      </div>
                      <div className="form-group">
                        <label className="label" htmlFor="licenseNo" style={{ fontSize: '0.75rem', color: '#7A9484' }}>DISCOM Empanelment License No.</label>
                        <input
                          type="text"
                          id="licenseNo"
                          className="input"
                          value={formData.licenseNo}
                          onChange={e => update('licenseNo', e.target.value)}
                          placeholder="e.g. DISCOM-EMP-2024-884"
                          required
                          style={{ fontSize: '0.875rem' }}
                        />
                        {errors.licenseNo && <p className="text-red text-xs">{errors.licenseNo}</p>}
                        <p style={{ fontSize: '0.6875rem', color: '#4A6055', marginTop: '4px' }}>
                          Mandatory for PM Surya Ghar Direct Benefit Transfer (DBT) consumer filing.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="label" htmlFor="propertyType" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Property Type</label>
                        <select
                          id="propertyType"
                          className="input select"
                          value={formData.propertyType}
                          onChange={e => update('propertyType', e.target.value)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          <option value="Independent House">Independent House / Row House</option>
                          <option value="Flat/Apartment">Flat / Apartment Complex</option>
                          <option value="Villa">Villa / Bungalow</option>
                          <option value="Agricultural Land">Agricultural / Unused Land</option>
                          <option value="Commercial">Commercial / Industrial Building</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="label" htmlFor="roofArea" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Approximate Roof Area (sq ft)</label>
                        <input
                          type="number"
                          id="roofArea"
                          className="input"
                          value={formData.roofArea}
                          onChange={e => update('roofArea', e.target.value)}
                          placeholder="e.g. 800"
                          min="1"
                          style={{ fontSize: '0.875rem' }}
                        />
                        {errors.roofArea && <p className="text-red text-xs">{errors.roofArea}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="flex-col gap-6">
                  <div className="form-group">
                    <label className="label" htmlFor="state" style={{ fontSize: '0.75rem', color: '#7A9484' }}>
                      {isBusiness ? 'Primary Operating State' : 'State'}
                    </label>
                    <select
                      id="state"
                      className="input select"
                      value={formData.state}
                      onChange={e => update('state', e.target.value)}
                      style={{ fontSize: '0.875rem' }}
                    >
                      <option value="">Select operating state</option>
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red text-xs">{errors.state}</p>}
                  </div>

                  {isBusiness ? (
                    <div className="form-group">
                      <label className="label" htmlFor="city" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Headquarters / Primary City</label>
                      <input
                        type="text"
                        id="city"
                        className="input"
                        value={formData.city}
                        onChange={e => update('city', e.target.value)}
                        placeholder="e.g. Pune / Mumbai"
                        style={{ fontSize: '0.875rem' }}
                      />
                      {errors.city && <p className="text-red text-xs">{errors.city}</p>}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="label" htmlFor="billAmount" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Average Monthly Bill (₹)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7A9484', fontWeight: 600 }}>₹</span>
                        <input
                          type="number"
                          id="billAmount"
                          className="input"
                          style={{ paddingLeft: '32px', fontSize: '0.875rem' }}
                          value={formData.billAmount}
                          onChange={e => update('billAmount', e.target.value)}
                          placeholder="e.g. 3200"
                          min="1"
                        />
                      </div>
                      {errors.billAmount && <p className="text-red text-xs">{errors.billAmount}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="flex-col gap-6">
                  {isBusiness ? (
                    <div className="form-group">
                      <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Business Specialization</label>
                      <div className="toggle-group" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                          { label: 'EPC Installer', desc: 'Turnkey Residential & Commercial Solar Rooftop Installation' },
                          { label: 'Module Manufacturer', desc: 'ALMM & BIS Certified Solar PV Cell / Module Manufacturing' },
                          { label: 'O&M Maintenance', desc: 'Solar Panel Cleaning, Inverter Repair & Operations Maintenance' }
                        ].map(opt => (
                          <button
                            key={opt.label}
                            type="button"
                            className={`toggle-option ${formData.businessType === opt.label ? 'toggle-option--selected' : ''}`}
                            onClick={() => update('businessType', opt.label)}
                            style={{ textAlign: 'left', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column' }}
                          >
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ECF2EE' }}>{opt.label}</span>
                            <span style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '2px' }}>{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Do you currently have solar panels installed?</label>
                        <div className="toggle-group">
                          {['Yes', 'No'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              className={`toggle-option ${formData.hasSolar === opt ? 'toggle-option--selected' : ''}`}
                              onClick={() => update('hasSolar', opt)}
                              style={{ fontSize: '0.875rem' }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Are you interested in battery storage?</label>
                        <div className="toggle-group">
                          {['Yes', 'No'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              className={`toggle-option ${formData.wantsBattery === opt ? 'toggle-option--selected' : ''}`}
                              onClick={() => update('wantsBattery', opt)}
                              style={{ fontSize: '0.875rem' }}
                            >
                              {opt === 'Yes' ? 'Yes, battery storage' : 'No, grid-tied only'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <div className="flex-col gap-6">
                  {isBusiness ? (
                    <div className="glass-card glass-card--sm" style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle size={22} weight="duotone" color="#22C55E" />
                        <div>
                          <h4 className="text-primary font-semibold" style={{ margin: 0, fontSize: '0.9375rem' }}>Ready to Launch Installer Portal</h4>
                          <p className="text-secondary text-xs" style={{ margin: 0, color: '#7A9484' }}>License: {formData.licenseNo}</p>
                        </div>
                      </div>

                      <div className="grid-2 gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                        <div><span style={{ color: '#4A6055' }}>Company:</span> <strong className="text-primary">{formData.companyName}</strong></div>
                        <div><span style={{ color: '#4A6055' }}>Contact:</span> <strong className="text-primary">{formData.firstName}</strong></div>
                        <div><span style={{ color: '#4A6055' }}>GSTIN:</span> <strong className="text-accent">{formData.gstin}</strong></div>
                        <div><span style={{ color: '#4A6055' }}>Operating State:</span> <strong className="text-primary">{formData.state}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card glass-card--sm" style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle size={22} weight="duotone" color="#22C55E" />
                        <div>
                          <h4 className="text-primary font-semibold" style={{ margin: 0, fontSize: '0.9375rem' }}>Ready to Generate Solar Intelligence</h4>
                          <p className="text-secondary text-xs" style={{ margin: 0, color: '#7A9484' }}>DISCOM: {formData.discom || 'Auto-detected'}</p>
                        </div>
                      </div>

                      <div className="grid-2 gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                        <div><span style={{ color: '#4A6055' }}>Name:</span> <strong className="text-primary">{formData.firstName || 'User'}</strong></div>
                        <div><span style={{ color: '#4A6055' }}>State:</span> <strong className="text-primary">{formData.state || 'Selected'}</strong></div>
                        <div><span style={{ color: '#4A6055' }}>Monthly Bill:</span> <strong className="text-accent">₹{formData.billAmount || '—'}</strong></div>
                        <div><span style={{ color: '#4A6055' }}>Roof Area:</span> <strong className="text-primary">{formData.roofArea || '—'} sq ft</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex justify-between gap-4 mt-8">
                {currentStep > 1 ? (
                  <button type="button" className="btn btn-ghost" onClick={handlePrev} style={{ fontSize: '0.875rem' }}>
                    <ArrowLeft size={15} /> {t('back') || 'Back'}
                  </button>
                ) : <div />}

                {currentStep < 5 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext} style={{ fontSize: '0.875rem' }}>
                    {t('next') || 'Next Step'} <ArrowRight size={15} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-lg flex-1 justify-center" style={{ fontSize: '0.9375rem' }}>
                    {isBusiness ? 'Open Installer Marketplace Portal' : 'View My Solar Dashboard'} <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column Preview Card */}
        <div className="onboarding-preview-col flex-col gap-6" style={{ width: '400px' }}>
          {isBusiness ? (
            /* Business Installer Preview Card */
            <div
              className="glass-card"
              style={{
                background: 'rgba(10,18,13,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(168,255,62,0.18)',
                padding: '2.25rem 1.75rem'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(168,255,62,0.08)',
                  border: '1px solid rgba(168,255,62,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Briefcase size={24} weight="duotone" color="#A8FF3E" />
              </div>

              <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: '#ECF2EE', marginBottom: '0.375rem' }}>
                Solar Business Partner
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#7A9484', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Verified installer network connecting empanelled businesses directly with qualified Indian consumers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <IdentificationCard size={18} weight="duotone" color="#A8FF3E" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE' }}>GSTIN &amp; DISCOM Verified</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>Instant credibility badge for consumer inquiries.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <MapPin size={18} weight="duotone" color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE' }}>State Territory Routing</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>Receive leads matched to your licensed operating state.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <ShieldCheck size={18} weight="duotone" color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE' }}>PM Surya Ghar DBT Ready</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>Direct access to subsidy-eligible residential inquiries.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : !hasBillData ? (
            /* Consumer Possibilities Card before entering bill */
            <div
              className="glass-card"
              style={{
                background: 'rgba(10,18,13,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '2.25rem 1.75rem'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(168,255,62,0.08)',
                  border: '1px solid rgba(168,255,62,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Sparkle size={24} weight="duotone" color="#A8FF3E" />
              </div>

              <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: '#ECF2EE', marginBottom: '0.375rem' }}>
                Solar Possibilities in India
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#7A9484', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Fill in your details in the form to model your 25-year ROI, system capacity, and PM Surya Ghar subsidy.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Lightning size={18} weight="duotone" color="#A8FF3E" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE' }}>Up to 100% Bill Offset</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>Generate up to 300 units of free electricity per month.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CheckCircle size={18} weight="duotone" color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE' }}>Up to ₹78,000 Govt Subsidy</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>Direct Bank Transfer (DBT) credit under PM Surya Ghar.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CurrencyInr size={18} weight="duotone" color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ECF2EE' }}>3 to 4 Years Payback</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484' }}>Full ROI within 4 years with 25-year panel lifetime.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Consumer Live Savings Card */
            <div
              className="glass-card text-center"
              style={{
                background: 'rgba(10,18,13,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(168,255,62,0.2)',
                padding: '2.25rem 1.75rem'
              }}
            >
              <div
                className="flex items-center justify-center rounded-full mx-auto mb-4"
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(168,255,62,0.10)',
                  border: '1px solid rgba(168,255,62,0.22)'
                }}
              >
                <Sparkle size={28} weight="duotone" color="#A8FF3E" />
              </div>

              <p className="stat-label text-xs letter-wide">Est. 25-Year Cumulative Savings</p>
              <div className="stat-value stat-value--accent mb-1" style={{ fontSize: '2.25rem', fontWeight: 800 }}>
                ₹{savings25Year} Lakh
              </div>
              <p className="stat-sublabel text-secondary" style={{ fontSize: '0.8125rem' }}>
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
                  <p className="text-lg font-bold text-amber" style={{ margin: 0 }}>
                    ₹{Number(recommendedKW) <= 1 ? '30,000' : Number(recommendedKW) <= 2 ? '60,000' : '78,000'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info Card */}
          <div className="glass-card glass-card--sm flex items-center gap-4">
            <ShieldCheck size={26} weight="duotone" color="#22C55E" style={{ flexShrink: 0 }} />
            <div>
              <p className="text-primary font-semibold text-sm" style={{ margin: 0, fontSize: '0.8125rem' }}>
                {isBusiness ? 'Empanelled Vendor Verification' : 'PM Surya Ghar Muft Bijli Yojana'}
              </p>
              <p className="text-muted text-xs" style={{ margin: 0, color: '#7A9484' }}>
                {isBusiness ? 'GSTIN & license check required for consumer lead routing.' : 'Up to ₹78,000 direct bank subsidy for residential rooftop solar.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;
