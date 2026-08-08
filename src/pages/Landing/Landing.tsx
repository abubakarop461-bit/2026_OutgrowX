import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '../../context/AppContext';
import { Sun, ShieldCheck, Zap, BarChart3, FileSearch, MapPin, Store, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    navigate('/onboarding');
  };

  const featureIcons = [
    { icon: <Sun size={20} color="#A8FF3E" />, label: 'AI Solar Score' },
    { icon: <Zap size={20} color="#F59E0B" />, label: 'Govt Subsidies' },
    { icon: <BarChart3 size={20} color="#22C55E" />, label: 'ROI Calculator' },
    { icon: <FileSearch size={20} color="#A8FF3E" />, label: 'Bill Scanner' },
    { icon: <MapPin size={20} color="#3B82F6" />, label: 'Land Analysis' },
    { icon: <Store size={20} color="#EC4899" />, label: 'Vendor Marketplace' },
  ];

  const statBadges = [
    '28 States & UTs Covered',
    'PM Surya Ghar Scheme Ready',
    'AI Model Chain Powered'
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '3rem 1.5rem', background: 'var(--bg-base)', position: 'relative' }}>
      
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '3.5rem', marginTop: '1rem', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(168,255,62,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,255,62,0.3)',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sun size={28} color="#A8FF3E" />
          </div>
          <h1 style={{ fontSize: '3.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 900, margin: 0, color: '#F0FFF4' }}>
            Sury<span style={{ color: '#A8FF3E' }}>X</span>
          </h1>
        </div>
        <h2 style={{ fontSize: '1.375rem', color: 'var(--text-secondary)', fontWeight: 400, margin: 0 }}>
          India's AI-Powered Solar Intelligence Platform
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
          Instant bill parsing · 25-Year ROI modeling · Verified installers · DISCOM policy matching
        </p>
      </header>

      {/* Role Selector Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem', 
        maxWidth: '1140px', 
        margin: '0 auto',
        width: '100%',
        zIndex: 1
      }}>
        
        {/* Card 1: Consumer */}
        <div className="glass-card role-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', cursor: 'pointer' }}
          onClick={() => handleRoleSelect('consumer')}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🏠</div>
          <h3 style={{ fontSize: '1.625rem', margin: '0 0 0.75rem 0', fontFamily: 'Outfit, sans-serif', color: '#F0FFF4' }}>I Want Solar</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Calculate 25-year ROI, scan your electricity bill with AI, and connect with empanelled installers.
          </p>
          <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleRoleSelect('consumer'); }} style={{ width: '100%', justifyContent: 'center' }}>
            Calculate My Solar <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 2: Landowner */}
        <div className="glass-card role-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', cursor: 'pointer' }}
          onClick={() => handleRoleSelect('landowner')}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🌾</div>
          <h3 style={{ fontSize: '1.625rem', margin: '0 0 0.75rem 0', fontFamily: 'Outfit, sans-serif', color: '#F0FFF4' }}>I Have Unused Land</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Evaluate your land's solar generation potential, annual lease revenue, and PM-KUSUM scheme eligibility.
          </p>
          <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleRoleSelect('landowner'); }} style={{ width: '100%', justifyContent: 'center' }}>
            Analyze My Land <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 3: Business */}
        <div className="glass-card role-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', cursor: 'pointer' }}
          onClick={() => handleRoleSelect('business')}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🏢</div>
          <h3 style={{ fontSize: '1.625rem', margin: '0 0 0.75rem 0', fontFamily: 'Outfit, sans-serif', color: '#F0FFF4' }}>I'm a Solar Business</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Join our marketplace to receive qualified residential and commercial leads in your state.
          </p>
          <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); handleRoleSelect('business'); }} style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
            Join Marketplace <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* Feature Strip */}
      <div style={{ marginTop: '4rem', padding: '1.5rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', maxWidth: '1140px', margin: '0 auto' }}>
          {featureIcons.map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
              {feature.icon}
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Stats */}
      <footer style={{ marginTop: 'auto', paddingTop: '2.5rem', textAlign: 'center', zIndex: 1 }}>
        <p style={{ color: '#F0FFF4', marginBottom: '1rem', fontSize: '1rem', fontWeight: 500 }}>
          Empowering Indian homeowners & businesses to transition to clean energy
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {statBadges.map((badge, i) => (
            <span key={i} className={`badge ${i === 1 ? 'badge--accent' : 'badge--green'}`}>
              {badge}
            </span>
          ))}
        </div>
      </footer>

      <style>{`
        .role-card {
          transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
        }
        .role-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 36px rgba(168, 255, 62, 0.12);
          border-color: rgba(168, 255, 62, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Landing;
