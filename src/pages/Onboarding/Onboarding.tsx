import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Stub if context not built yet
const useApp = () => ({
  completeOnboarding: () => {},
  profile: {} as any,
  setProfile: (p: any) => {}
});

const Step1Identity = ({ profile, setProfile, onNext }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <label className="label">What's your first name?</label>
        <input 
          type="text" 
          className="input" 
          value={profile.firstName || ''} 
          onChange={e => setProfile({...profile, firstName: e.target.value})}
          placeholder="e.g. Rahul"
        />
      </div>
      <div>
        <label className="label">I am a...</label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['Homeowner', 'Tenant', 'Business Owner'].map(type => (
            <button
              key={type}
              className={`toggle-option ${profile.userType === type ? 'toggle-option--selected' : ''}`}
              onClick={() => setProfile({...profile, userType: type})}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" onClick={onNext} disabled={!profile.firstName || !profile.userType}>
        Next →
      </button>
    </div>
  );
};

const Step2Property = ({ profile, setProfile, onNext, onPrev }: any) => {
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <label className="label">Property type</label>
        <select 
          className="select" 
          value={profile.propertyType || ''} 
          onChange={e => setProfile({...profile, propertyType: e.target.value})}
        >
          <option value="">Select property type...</option>
          <option value="Flat/Apartment">Flat/Apartment</option>
          <option value="Independent House">Independent House</option>
          <option value="Villa">Villa</option>
          <option value="Agricultural Land">Agricultural Land</option>
          <option value="Commercial">Commercial</option>
        </select>
      </div>
      <div>
        <label className="label">Approximate roof/usable area (sq ft)</label>
        <input 
          type="number" 
          className="input" 
          value={profile.roofArea || ''} 
          onChange={e => setProfile({...profile, roofArea: e.target.value})}
          placeholder="e.g. 1000"
        />
        <p style={{ color: '#8BAF95', fontSize: '0.875rem', marginTop: '0.5rem' }}>Used to calculate max solar capacity.</p>
      </div>
      <div>
        <label className="label">State</label>
        <select 
          className="select" 
          value={profile.state || ''} 
          onChange={e => setProfile({...profile, state: e.target.value})}
        >
          <option value="">Select state...</option>
          {indianStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onNext} style={{ flex: 1 }} disabled={!profile.propertyType || !profile.roofArea || !profile.state}>
          Next →
        </button>
      </div>
    </div>
  );
};

const Step3Bill = ({ profile, setProfile, onNext, onPrev }: any) => {
  const getDiscomForState = (state: string) => {
    if (!state) return 'Unknown DISCOM';
    const discoms: Record<string, string> = {
      'Maharashtra': 'MSEDCL',
      'Gujarat': 'PGVCL / DGVCL',
      'Karnataka': 'BESCOM',
      'Delhi': 'BSES Rajdhani',
      'Tamil Nadu': 'TANGEDCO',
      'Uttar Pradesh': 'UPPCL'
    };
    return discoms[state] || `${state} State Electricity Board`;
  };

  const detectedDiscom = getDiscomForState(profile.state);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <label className="label">Average monthly electricity bill (₹)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F0FFF4' }}>₹</span>
          <input 
            type="number" 
            className="input" 
            style={{ paddingLeft: '2.5rem' }}
            value={profile.billAmount || ''} 
            onChange={e => setProfile({...profile, billAmount: e.target.value})}
            placeholder="e.g. 3000"
          />
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <Link to="/solar-ai" style={{ color: '#A8FF3E', fontSize: '0.875rem', textDecoration: 'none' }}>
            📷 Upload a bill to auto-fill
          </Link>
        </div>
      </div>
      <div>
        <label className="label">Your approximate DISCOM</label>
        <input 
          type="text" 
          className="input" 
          value={profile.discom || detectedDiscom} 
          onChange={e => setProfile({...profile, discom: e.target.value})}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onNext} style={{ flex: 1 }} disabled={!profile.billAmount}>
          Next →
        </button>
      </div>
    </div>
  );
};

const Step4SolarStatus = ({ profile, setProfile, onNext, onPrev }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <label className="label">Do you currently have solar panels installed?</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              className={`toggle-option ${profile.hasSolar === opt ? 'toggle-option--selected' : ''}`}
              style={{ flex: 1, padding: '1rem', fontSize: '1.2rem' }}
              onClick={() => setProfile({...profile, hasSolar: opt})}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {profile.hasSolar === 'Yes' && (
        <>
          <div>
            <label className="label">System size (kW)</label>
            <input 
              type="number" 
              className="input" 
              value={profile.systemSize || ''} 
              onChange={e => setProfile({...profile, systemSize: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Installation year</label>
            <input 
              type="number" 
              className="input" 
              value={profile.installYear || ''} 
              onChange={e => setProfile({...profile, installYear: e.target.value})}
            />
          </div>
        </>
      )}

      <div>
        <label className="label">Are you interested in battery storage?</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              className={`toggle-option ${profile.wantsBattery === opt ? 'toggle-option--selected' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setProfile({...profile, wantsBattery: opt})}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onNext} style={{ flex: 1 }} disabled={!profile.hasSolar || !profile.wantsBattery}>
          Next →
        </button>
      </div>
    </div>
  );
};

const Step5Location = ({ profile, setProfile, onSubmit, onPrev }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <label className="label">Your city</label>
        <input 
          type="text" 
          className="input" 
          value={profile.city || ''} 
          onChange={e => setProfile({...profile, city: e.target.value})}
          placeholder="e.g. Pune"
        />
      </div>
      <div>
        <label className="label">PIN code</label>
        <input 
          type="text" 
          className="input" 
          maxLength={6}
          value={profile.pincode || ''} 
          onChange={e => setProfile({...profile, pincode: e.target.value})}
          placeholder="e.g. 411001"
        />
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', backgroundColor: 'rgba(168, 255, 62, 0.05)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#A8FF3E' }}>Information Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div><span style={{ color: '#8BAF95' }}>Name:</span> {profile.firstName}</div>
          <div><span style={{ color: '#8BAF95' }}>Type:</span> {profile.userType}</div>
          <div><span style={{ color: '#8BAF95' }}>State:</span> {profile.state}</div>
          <div><span style={{ color: '#8BAF95' }}>Avg Bill:</span> ₹{profile.billAmount}</div>
          <div><span style={{ color: '#8BAF95' }}>Property:</span> {profile.propertyType}</div>
          <div><span style={{ color: '#8BAF95' }}>Area:</span> {profile.roofArea} sqft</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onSubmit} style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }} disabled={!profile.city || !profile.pincode}>
          View My Solar Dashboard →
        </button>
      </div>
    </div>
  );
};

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<any>({});
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSubmit = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  const estimatedSavings = profile.billAmount ? Number(profile.billAmount) * 12 * 0.85 : 48000;
  const formattedSavings = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(estimatedSavings);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', padding: '2rem' }}>
      
      {/* Left Column: Wizard */}
      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
          {[1, 2, 3, 4, 5].map(step => (
            <React.Fragment key={step}>
              <div 
                className={`step-dot ${step === currentStep ? 'step-dot--active' : ''} ${step < currentStep ? 'step-dot--done' : ''}`}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: step === currentStep ? '#A8FF3E' : step < currentStep ? '#A8FF3E' : 'rgba(255,255,255,0.1)',
                  color: step === currentStep ? '#070D09' : step < currentStep ? '#070D09' : '#8BAF95',
                  fontWeight: 'bold', zIndex: 2
                }}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 5 && (
                <div 
                  className={`step-line ${step < currentStep ? 'step-line--done' : ''}`}
                  style={{ 
                    flex: 1, height: '2px', 
                    backgroundColor: step < currentStep ? '#A8FF3E' : 'rgba(255,255,255,0.1)',
                    margin: '0 8px'
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {currentStep === 1 && "Let's get to know you"}
          {currentStep === 2 && "Tell us about your property"}
          {currentStep === 3 && "Understanding your energy usage"}
          {currentStep === 4 && "Current solar setup"}
          {currentStep === 5 && "Where are you located?"}
        </h2>
        <p style={{ color: '#8BAF95', marginBottom: '3rem' }}>Step {currentStep} of 5</p>

        <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
          <div style={{ 
            transition: 'transform 0.4s ease-in-out', 
            transform: `translateX(-${(currentStep - 1) * 100}%)`,
            display: 'flex',
            width: '500%'
          }}>
            <div style={{ width: '20%', paddingRight: '20px' }}>
              <Step1Identity profile={profile} setProfile={setProfile} onNext={handleNext} />
            </div>
            <div style={{ width: '20%', paddingRight: '20px' }}>
              <Step2Property profile={profile} setProfile={setProfile} onNext={handleNext} onPrev={handlePrev} />
            </div>
            <div style={{ width: '20%', paddingRight: '20px' }}>
              <Step3Bill profile={profile} setProfile={setProfile} onNext={handleNext} onPrev={handlePrev} />
            </div>
            <div style={{ width: '20%', paddingRight: '20px' }}>
              <Step4SolarStatus profile={profile} setProfile={setProfile} onNext={handleNext} onPrev={handlePrev} />
            </div>
            <div style={{ width: '20%', paddingRight: '20px' }}>
              <Step5Location profile={profile} setProfile={setProfile} onSubmit={handleSubmit} onPrev={handlePrev} />
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Preview/Context */}
      <div className="right-column-preview" style={{ flex: 1, display: 'none', paddingLeft: '4rem', alignItems: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '500px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(7,13,9,0.8) 0%, rgba(168,255,62,0.05) 100%)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚡️</div>
          <h3 style={{ fontSize: '1.5rem', color: '#8BAF95', marginBottom: '1rem' }}>Estimated Annual Savings</h3>
          <div style={{ fontSize: '3.5rem', fontFamily: 'Outfit', color: '#A8FF3E', fontWeight: 'bold' }}>
            ₹{formattedSavings}
          </div>
          <p style={{ color: '#8BAF95', marginTop: '1rem', fontSize: '0.9rem' }}>
            {profile.billAmount ? "Based on your reported electricity bill." : "Placeholder estimate. Enter your bill to see live updates."}
          </p>
        </div>
      </div>
      
      {/* Media query equivalent for the right column */}
      <style>
        {`
          @media (min-width: 992px) {
            .right-column-preview {
              display: flex !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Onboarding;
