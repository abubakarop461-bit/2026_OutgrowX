import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '../../context/AppContext';
import { Sun, Zap, BarChart3, FileSearch, MapPin, Store, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    navigate('/onboarding');
  };

  const roles = [
    {
      role: 'consumer' as UserRole,
      icon: '🏠',
      title: 'I Want Solar',
      desc: 'Calculate 25-year ROI, scan your electricity bill with AI, and connect with empanelled installers.',
      cta: 'Calculate My Solar',
      variant: 'btn-primary',
    },
    {
      role: 'landowner' as UserRole,
      icon: '🌾',
      title: 'I Have Unused Land',
      desc: "Evaluate your land's solar generation potential, annual lease revenue, and PM-KUSUM scheme eligibility.",
      cta: 'Analyze My Land',
      variant: 'btn-secondary',
    },
    {
      role: 'business' as UserRole,
      icon: '🏢',
      title: "I'm a Solar Business",
      desc: 'Join our marketplace to receive qualified residential and commercial leads in your state.',
      cta: 'Join Marketplace',
      variant: 'btn-ghost',
    },
  ];

  const features = [
    { icon: <Sun size={20} className="text-accent" />, label: 'AI Solar Score' },
    { icon: <Zap size={20} className="text-amber" />, label: 'Govt Subsidies' },
    { icon: <BarChart3 size={20} className="text-green" />, label: 'ROI Calculator' },
    { icon: <FileSearch size={20} className="text-accent" />, label: 'Bill Scanner' },
    { icon: <MapPin size={20} style={{ color: '#3B82F6' }} />, label: 'Land Analysis' },
    { icon: <Store size={20} style={{ color: '#EC4899' }} />, label: 'Vendor Marketplace' },
  ];

  const statBadges = [
    '28 States & UTs Covered',
    'PM Surya Ghar Scheme Ready',
    'AI Model Chain Powered',
  ];

  return (
    <main className="page page--centered" style={{ padding: '3rem 1.5rem' }}>
      <a href="#role-selector" className="skip-link">
        Skip to role selection
      </a>

      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Header */}
      <header className="section--lg text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(168,255,62,0.12)',
              border: '1px solid rgba(168,255,62,0.3)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sun size={28} className="text-accent" />
          </div>
          <h1 style={{ fontSize: '3.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 900, margin: 0, color: '#F0FFF4' }}>
            Surya<span style={{ color: '#A8FF3E' }}>Setu</span>
          </h1>
        </div>
        <h2 className="text-secondary font-normal" style={{ fontSize: '1.375rem' }}>
          India's AI-Powered Solar Intelligence Platform
        </h2>
        <p className="text-muted" style={{ fontSize: '0.9375rem', marginTop: '0.5rem' }}>
          Instant bill parsing · 25-Year ROI modeling · Verified installers · DISCOM policy matching
        </p>
      </header>

      {/* Role Selector Cards */}
      <div
        id="role-selector"
        className="relative z-10 w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1140px',
          margin: '0 auto',
        }}
        role="group"
        aria-label="Select your role"
      >
        {roles.map((r) => (
          <div
            key={r.role}
            className="glass-card role-card flex-col items-center text-center"
            style={{ padding: '3rem 2rem' }}
            onClick={() => handleRoleSelect(r.role)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRoleSelect(r.role);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select ${r.title} role`}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>{r.icon}</div>
            <h3 style={{ fontSize: '1.625rem', marginBottom: '0.75rem' }}>{r.title}</h3>
            <p className="text-secondary flex-1" style={{ marginBottom: '2rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {r.desc}
            </p>
            <button
              className={`btn ${r.variant} w-full justify-center`}
              onClick={(e) => {
                e.stopPropagation();
                handleRoleSelect(r.role);
              }}
              aria-label={r.cta}
            >
              {r.cta} <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Feature Strip */}
      <section
        className="relative z-10 w-full"
        style={{
          marginTop: '4rem',
          padding: '1.5rem 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          maxWidth: '1140px',
          margin: '4rem auto 0',
        }}
        aria-label="Platform features"
      >
        <div className="feature-strip">
          {features.map((feature, i) => (
            <div key={i} className="feature-item">
              {feature.icon}
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Stats */}
      <footer className="relative z-10 w-full text-center" style={{ marginTop: 'auto', paddingTop: '2.5rem' }}>
        <p className="text-primary font-medium" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          Empowering Indian homeowners & businesses to transition to clean energy
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          {statBadges.map((badge, i) => (
            <span key={i} className={`badge ${i === 1 ? 'badge--accent' : 'badge--green'}`}>
              {badge}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default Landing;
