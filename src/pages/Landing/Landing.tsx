import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '../../context/AppContext';
import {
  House, Plant, Buildings, Sun, Lightning, ChartBar, Receipt, MapPin, Storefront, ArrowRight, CheckCircle, Globe
} from '@phosphor-icons/react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole, isAuthenticated } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/onboarding');
    }
  };

  const roles = [
    {
      role: 'consumer' as UserRole,
      Icon: House,
      title: 'I Want Solar',
      desc: 'Calculate 25-year ROI, scan your electricity bill with AI, and connect with empanelled installers.',
      cta: 'Calculate My Solar',
      isPrimary: true,
    },
    {
      role: 'landowner' as UserRole,
      Icon: Plant,
      title: 'I Have Unused Land',
      desc: "Evaluate your land's solar generation potential, annual lease revenue, and PM-KUSUM eligibility.",
      cta: 'Analyze My Land',
      isPrimary: false,
    },
    {
      role: 'business' as UserRole,
      Icon: Buildings,
      title: "I'm a Solar Business",
      desc: 'Join our marketplace to receive qualified residential and commercial solar leads in your state.',
      cta: 'Join Marketplace',
      isPrimary: false,
    },
  ];

  const features = [
    { Icon: Sun,        label: 'AI Solar Score',       color: '#A8FF3E' },
    { Icon: Lightning,  label: 'Govt Subsidies',        color: '#F59E0B' },
    { Icon: ChartBar,   label: 'ROI Calculator',        color: '#A8FF3E' },
    { Icon: Receipt,    label: 'Bill Scanner',           color: '#A8FF3E' },
    { Icon: MapPin,     label: 'Land Analysis',          color: '#60A5FA' },
    { Icon: Storefront, label: 'Vendor Marketplace',    color: '#A78BFA' },
  ];

  const statBadges = [
    { Icon: Globe,        label: '28 States & UTs Covered' },
    { Icon: CheckCircle,  label: 'PM Surya Ghar 2024 Ready' },
    { Icon: Sun,          label: 'AI Model Chain Powered'  },
  ];

return (
    <main className="page--static page--static-centered" style={{ padding: '2rem 1rem' }}>
      <a href="#role-selector" className="skip-link">Skip to role selection</a>

      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(168,255,62,0.04) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <header className="section--lg text-center relative z-10" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(168,255,62,0.10)', border: '1px solid rgba(168,255,62,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sun size={20} weight="duotone" color="#A8FF3E" />
          </div>
          <h1 style={{
            fontSize: '2.25rem', fontFamily: 'Outfit, sans-serif',
            fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#ECF2EE',
          }}>
            Surya<span style={{ color: '#A8FF3E' }}>Setu</span>
          </h1>
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 400, color: '#7A9484', margin: '0.375rem 0 0' }}>
          India's AI-Powered Solar Intelligence Platform
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#4A6055', marginTop: '0.25rem' }}>
          Instant bill parsing · 25-Year ROI modelling · Verified installers · DISCOM policy matching
        </p>
      </header>

      {/* Role Cards */}
      <div
        id="role-selector"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          maxWidth: '1060px',
          width: '100%',
          margin: '0 auto',
          position: 'relative', zIndex: 10,
        }}
        role="group"
        aria-label="Select your role"
      >
        {roles.map(({ role, Icon, title, desc, cta, isPrimary }) => (
          <div
            key={role}
            style={{
              background: 'rgba(10,18,13,0.80)',
              backdropFilter: 'blur(20px)',
              border: isPrimary ? '1px solid rgba(168,255,62,0.20)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '1.75rem 1.25rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
            }}
            onClick={() => handleRoleSelect(role)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,255,62,0.30)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(168,255,62,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = isPrimary ? 'rgba(168,255,62,0.20)' : 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRoleSelect(role); } }}
            role="button"
            tabIndex={0}
            aria-label={`Select ${title} role`}
          >
            {/* Icon Box */}
            <div style={{
              width: 52, height: 52, borderRadius: '12px', marginBottom: '1rem',
              background: isPrimary ? 'rgba(168,255,62,0.10)' : 'rgba(255,255,255,0.05)',
              border: isPrimary ? '1px solid rgba(168,255,62,0.20)' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={24} weight="duotone" color={isPrimary ? '#A8FF3E' : '#7A9484'} />
            </div>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.125rem',
              fontWeight: 700, color: '#ECF2EE', marginBottom: '0.5rem',
            }}>{title}</h3>
            <p style={{
              fontSize: '0.8125rem', lineHeight: 1.6, color: '#7A9484',
              marginBottom: '1.25rem', flex: 1,
            }}>{desc}</p>
            <button
              className={isPrimary ? 'btn btn-primary w-full justify-center' : 'btn btn-ghost w-full justify-center'}
              onClick={e => { e.stopPropagation(); handleRoleSelect(role); }}
              aria-label={cta}
              style={{ fontSize: '0.8125rem', gap: '6px', padding: '0.5rem 1rem' }}
            >
              {cta} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Feature Strip */}
      <section style={{
        marginTop: '1.5rem', padding: '1rem 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '1060px', width: '100%',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {features.map(({ Icon, label, color }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#7A9484' }}>
              <Icon size={14} weight="duotone" color={color} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Footer badges */}
      <footer style={{ marginTop: '1rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <p style={{ fontSize: '0.8125rem', color: '#7A9484', marginBottom: '0.625rem' }}>
          Empowering Indian homeowners & businesses to transition to clean energy
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {statBadges.map(({ Icon, label }, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.6875rem', fontWeight: 600, color: '#7A9484',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              padding: '3px 10px', borderRadius: '999px',
            }}>
              <Icon size={12} weight="duotone" color="#A8FF3E" />
              {label}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default Landing;
