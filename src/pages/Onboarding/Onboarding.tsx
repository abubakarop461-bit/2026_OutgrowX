import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { DISCOM_BY_STATE } from '../../data/stateElectricityRates';
import {
  House, Plant, Buildings, ArrowRight, ArrowLeft,
  Check, ShieldCheck, Lightning, CheckCircle,
  MapPin, Briefcase
} from '@phosphor-icons/react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, setProfile, completeOnboarding, language } = useApp();
  const { t } = useTranslation();

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const strings = {
    identityTitle: isHi ? "पहचान और मार्ग" : isMr ? "ओळख आणि मार्ग" : "Identity & Pathway",
    identityDesc: isHi ? "बताएं कि आप सौर ऊर्जा से कैसे जुड़ना चाहते हैं।" : isMr ? "तुम्ही सौर ऊर्जेशी कसे जोडू इच्छिता ते सांगा." : "Tell us how you would like to engage with solar.",
    iamA: isHi ? "मैं हूँ एक..." : isMr ? "मी आहे..." : "I am a...",
    homeowner: isHi ? "गृहस्वामी" : isMr ? "घरमालक" : "Homeowner",
    landowner: isHi ? "जमीन मालिक" : isMr ? "जमीन मालक" : "Landowner",
    solarVendor: isHi ? "सौर वेंडर" : isMr ? "सोलर वेंडर" : "Solar Vendor",
    firstNameLabel: isHi ? "आपका पहला नाम क्या है?" : isMr ? "तुमचे पहिले नाव काय आहे?" : "What is your first name?",
    firstNamePlaceholder: isHi ? "अपना नाम दर्ज करें" : isMr ? "तुमचे नाव प्रविष्ट करा" : "Enter your name",
    companyLabel: isHi ? "कंपनी का कानूनी नाम" : isMr ? "कंपनीचे कायदेशीर नाव" : "Company Legal Name",
    companyPlaceholder: isHi ? "उदा. सूर्या पावर सॉल्यूशंस प्राइवेट लिमिटेड" : isMr ? "उदा. सूर्या पॉवर सोल्युशन्स प्रायव्हेट लिमिटेड" : "e.g. Surya Power Solutions Pvt Ltd",
    contactLabel: isHi ? "संपर्क व्यक्ति का नाम" : isMr ? "संपर्क व्यक्तीचे नाव" : "Contact Person Name",
    contactPlaceholder: isHi ? "आपका पूरा नाम" : isMr ? "तुमचे पूर्ण नाव" : "Your full name",
    next: isHi ? "आगे" : isMr ? "पुढे" : "Next",
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      if (currentStep === 1) {
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'Contact person name is required';
      }
      if (currentStep === 2) {
        if (!formData.gstin.trim()) newErrors.gstin = 'GSTIN is required';
        if (!formData.licenseNo.trim()) newErrors.licenseNo = 'License number is required';
      }
      if (currentStep === 3) {
        if (!formData.state) newErrors.state = 'Operating state is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
      }
    } else {
      if (currentStep === 1 && !formData.firstName.trim()) {
        newErrors.firstName = 'Name is required';
      }
      if (currentStep === 2 && (!formData.roofArea || Number(formData.roofArea) <= 0)) {
        newErrors.roofArea = 'Roof area must be greater than 0';
      }
      if (currentStep === 3 && (!formData.billAmount || Number(formData.billAmount) <= 0)) {
        newErrors.billAmount = 'Bill amount must be greater than 0';
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
        systemSize: formData.systemSize ? Number(formData.systemSize) : 0,
        wantsBattery: formData.wantsBattery === 'Yes',
        city: formData.city || 'City',
        pincode: formData.pincode || '411001',
      });
      completeOnboarding();
      navigate('/dashboard');
    }
  };

  const estimatedBillSavings = formData.billAmount ? Math.round(Number(formData.billAmount) * 12 * 0.85) : 0;
  const estimatedKW = formData.billAmount ? Math.max(1, Math.round(Number(formData.billAmount) / 1000)) : 3;
  const estimatedSubsidy = estimatedKW <= 1 ? 30000 : estimatedKW <= 2 ? 60000 : 78000;

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '40px 24px 80px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Step Indicator (Ventriloc 200px pills) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  background: currentStep === step ? 'var(--color-graphite)' : currentStep > step ? '#16a34a' : 'var(--color-ash)',
                  color: currentStep >= step ? '#ffffff' : 'var(--color-slate)',
                  transition: 'all 150ms ease',
                }}
              >
                {currentStep > step ? <Check size={14} weight="bold" /> : step}
              </div>
              {step < 5 && (
                <div
                  style={{
                    width: '32px',
                    height: '1px',
                    background: currentStep > step ? '#16a34a' : 'var(--color-mist)',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
          {/* Main Step Form (Ash card) */}
          <div
            style={{
              background: 'var(--color-ash)',
              borderRadius: 'var(--radius-cards)',
              padding: '36px 32px',
            }}
          >
            {/* Step 1: Role & Identity */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {strings.identityTitle}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-steel)', marginBottom: '24px' }}>
                  {strings.identityDesc}
                </p>

                {/* Role Toggles (Always Visible so any user role can switch) */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="label">{strings.iamA}</label>
                  <div className="toggle-group">
                    {['Homeowner', 'Landowner', 'Solar Vendor'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`toggle-option ${formData.userType === opt ? 'toggle-option--selected' : ''}`}
                        onClick={() => {
                          update('userType', opt);
                          // Reset business fields if switching away from business, or vice versa
                          if (opt !== 'Solar Vendor') {
                            update('companyName', '');
                          }
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                      >
                        {opt === 'Homeowner' && <House size={16} />}
                        {opt === 'Landowner' && <Plant size={16} />}
                        {opt === 'Solar Vendor' && <Briefcase size={16} />}
                        <span>
                          {opt === 'Homeowner' ? strings.homeowner : opt === 'Landowner' ? strings.landowner : strings.solarVendor}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {isBusiness ? (
                  <>
                    <div className="form-group">
                      <label className="label">{strings.companyLabel}</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={e => update('companyName', e.target.value)}
                        placeholder={strings.companyPlaceholder}
                      />
                      {errors.companyName && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.companyName}</p>}
                    </div>
                    <div className="form-group">
                      <label className="label">{strings.contactLabel}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        placeholder={strings.contactPlaceholder}
                      />
                      {errors.firstName && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.firstName}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">{strings.firstNameLabel}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        placeholder={strings.firstNamePlaceholder}
                      />
                      {errors.firstName && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.firstName}</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Property or Business Credentials */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {isBusiness ? 'Certifications & Licenses' : 'Property & Roof Specifications'}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-steel)', marginBottom: '24px' }}>
                  {isBusiness ? 'Verify your GSTIN and electrical empanelment license.' : 'Input usable area to compute maximum solar capacity.'}
                </p>

                {isBusiness ? (
                  <>
                    <div className="form-group">
                      <label className="label">Business GSTIN (15 Digits)</label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={e => update('gstin', e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAAAA0000A1Z5"
                        maxLength={15}
                      />
                      {errors.gstin && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.gstin}</p>}
                    </div>
                    <div className="form-group">
                      <label className="label">DISCOM Empanelment License No.</label>
                      <input
                        type="text"
                        value={formData.licenseNo}
                        onChange={e => update('licenseNo', e.target.value)}
                        placeholder="e.g. DISCOM-EMP-2024-884"
                      />
                      {errors.licenseNo && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.licenseNo}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="label">Property Type</label>
                      <select value={formData.propertyType} onChange={e => update('propertyType', e.target.value)}>
                        <option value="Independent House">Independent House / Bungalow</option>
                        <option value="Villa">Villa / Row House</option>
                        <option value="Agricultural Land">Agricultural Land / Farm</option>
                        <option value="Commercial">Commercial Building</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Approximate Usable Roof / Land Area (sq ft)</label>
                      <input
                        type="number"
                        value={formData.roofArea}
                        onChange={e => update('roofArea', e.target.value)}
                        placeholder="e.g. 800"
                        min="50"
                      />
                      <span style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px', display: 'block' }}>
                        ~107 sq ft required per 1 kW system.
                      </span>
                      {errors.roofArea && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.roofArea}</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Energy Spend or Territory */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {isBusiness ? 'Operating Jurisdiction' : 'Electricity Baseline & Utility'}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-steel)', marginBottom: '24px' }}>
                  {isBusiness ? 'Select your primary state and headquarters city.' : 'Your average monthly power bill helps determine payback.'}
                </p>

                <div className="form-group">
                  <label className="label">State</label>
                  <select value={formData.state} onChange={e => update('state', e.target.value)}>
                    <option value="">-- Select State --</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.state}</p>}
                </div>

                {!isBusiness && (
                  <div className="form-group">
                    <label className="label">Average Monthly Electricity Bill (₹)</label>
                    <input
                      type="number"
                      value={formData.billAmount}
                      onChange={e => update('billAmount', e.target.value)}
                      placeholder="e.g. 3200"
                    />
                    {errors.billAmount && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.billAmount}</p>}
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Detected / Preferred DISCOM</label>
                  <input
                    type="text"
                    value={formData.discom}
                    onChange={e => update('discom', e.target.value)}
                    placeholder="e.g. Maha Vitaran (MSEDCL)"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Solar & Storage Preferences */}
            {currentStep === 4 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Solar System Configuration
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-steel)', marginBottom: '24px' }}>
                  Specify your existing installation status and battery preferences.
                </p>

                <div className="form-group">
                  <label className="label">Do you currently have solar installed?</label>
                  <div className="toggle-group">
                    {['No', 'Yes'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`toggle-option ${formData.hasSolar === opt ? 'toggle-option--selected' : ''}`}
                        onClick={() => update('hasSolar', opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Are you interested in battery storage (Hybrid)?</label>
                  <div className="toggle-group">
                    {['Yes', 'No'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`toggle-option ${formData.wantsBattery === opt ? 'toggle-option--selected' : ''}`}
                        onClick={() => update('wantsBattery', opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Location Confirmation */}
            {currentStep === 5 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Finalize Location &amp; Summary
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-steel)', marginBottom: '24px' }}>
                  Review your recorded profile signals before launching your dashboard.
                </p>

                <div className="form-group">
                  <label className="label">City / Town</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => update('city', e.target.value)}
                    placeholder="e.g. Pune"
                  />
                </div>

                <div className="form-group">
                  <label className="label">PIN Code (6 Digits)</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={e => update('pincode', e.target.value)}
                    placeholder="e.g. 411001"
                    maxLength={6}
                  />
                  {errors.pincode && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.pincode}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons (Ventriloc 0px primary & secondary) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '16px' }}>
              {currentStep > 1 ? (
                <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}

              {currentStep < 5 ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  Launch Solar Dashboard <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Right Summary Card (Ventriloc White Card) */}
          <div
            style={{
              background: 'var(--color-canvas-white)',
              border: '1px solid var(--color-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brass)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                Live Context Synthesis
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '20px' }}>
                Estimated Solar Return
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Annual Savings</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--color-ember-orange)' }}>
                    ₹{estimatedBillSavings.toLocaleString('en-IN')}<span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>/yr</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eligible PM Subsidy</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--color-graphite)' }}>
                    ₹{estimatedSubsidy.toLocaleString('en-IN')} (DBT)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended System</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)' }}>
                    {estimatedKW} kW Grid-Tied PV
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '16px', fontSize: '12px', color: 'var(--color-slate)' }}>
              All calculations adhere to MNRE FY2024 benchmarks &amp; state DISCOM net-metering schedules.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;
