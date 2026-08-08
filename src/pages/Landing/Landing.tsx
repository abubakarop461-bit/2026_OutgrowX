import React from 'react';
import { useNavigate } from 'react-router-dom';

// Stub if context not built yet
const useApp = () => ({
  setRole: (role: string) => {}
});

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleRoleSelect = (role: string) => {
    setRole(role);
    navigate('/onboarding');
  };

  const featureIcons = [
    { icon: '☀️', label: 'AI Solar Score' },
    { icon: '💰', label: 'Govt Subsidies' },
    { icon: '📊', label: 'ROI Calculator' },
    { icon: '🔍', label: 'Bill Scanner' },
    { icon: '📍', label: 'Land Analysis' },
    { icon: '🏪', label: 'Vendor Marketplace' },
  ];

  const statBadges = [
    '28 States Covered',
    'PM Surya Ghar Ready',
    'AI-Powered'
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V2M12 22v-2M4 12H2m20 0h-2m-2.05-6.95l1.41-1.41M4.64 19.36l1.41-1.41m13.31 0l-1.41-1.41M4.64 4.64l1.41 1.41" stroke="#A8FF3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" fill="#A8FF3E"/>
            <path d="M12 16c-2 0-3 1-3 3 0 1.5 1 2 3 2s3-.5 3-2c0-2-1-3-3-3z" fill="#A8FF3E"/>
          </svg>
          <h1 style={{ fontSize: '3rem', fontFamily: 'Outfit', margin: 0, color: '#F0FFF4' }}>SuryX</h1>
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#8BAF95', fontWeight: 'normal', margin: 0 }}>
          India's Solar Intelligence Platform
        </h2>
      </header>

      {/* Role Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%',
        flex: 1
      }}>
        
        {/* Card 1 */}
        <div className="glass-card role-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', transition: 'transform 0.3s, box-shadow 0.3s' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
          <h3 style={{ fontSize: '1.75rem', margin: '0 0 1rem 0', fontFamily: 'Outfit' }}>I Want Solar</h3>
          <p style={{ color: '#8BAF95', marginBottom: '2rem', flex: 1 }}>Calculate savings, scan your bill, find the right installer</p>
          <button className="btn btn-primary" onClick={() => handleRoleSelect('consumer')} style={{ width: '100%' }}>
            Calculate My Solar →
          </button>
        </div>

        {/* Card 2 */}
        <div className="glass-card role-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', transition: 'transform 0.3s, box-shadow 0.3s' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌾</div>
          <h3 style={{ fontSize: '1.75rem', margin: '0 0 1rem 0', fontFamily: 'Outfit' }}>I Have Unused Land</h3>
          <p style={{ color: '#8BAF95', marginBottom: '2rem', flex: 1 }}>Turn your land into a clean energy revenue source</p>
          <button className="btn btn-secondary" onClick={() => handleRoleSelect('landowner')} style={{ width: '100%' }}>
            Analyze My Land →
          </button>
        </div>

        {/* Card 3 */}
        <div className="glass-card role-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', transition: 'transform 0.3s, box-shadow 0.3s' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
          <h3 style={{ fontSize: '1.75rem', margin: '0 0 1rem 0', fontFamily: 'Outfit' }}>I'm a Solar Business</h3>
          <p style={{ color: '#8BAF95', marginBottom: '2rem', flex: 1 }}>Connect with customers ready to go solar</p>
          <button className="btn btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid #A8FF3E', color: '#A8FF3E', width: '100%' }} onClick={() => handleRoleSelect('business')}>
            Join Marketplace →
          </button>
        </div>

      </div>

      {/* Feature Strip */}
      <div style={{ marginTop: '4rem', padding: '2rem 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', minWidth: 'max-content' }}>
          {featureIcons.map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8BAF95' }}>
              <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
              <span style={{ fontWeight: 500 }}>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Stats */}
      <footer style={{ marginTop: 'auto', paddingTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: '#F0FFF4', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Trusted by homeowners across India</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {statBadges.map((badge, i) => (
            <span key={i} className={`badge ${i === 1 ? 'badge--accent' : 'badge--green'}`}>
              {badge}
            </span>
          ))}
        </div>
      </footer>

      <style>
        {`
          .role-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(168, 255, 62, 0.1);
            border-color: rgba(168, 255, 62, 0.3);
          }
        `}
      </style>
    </div>
  );
};

export default Landing;
