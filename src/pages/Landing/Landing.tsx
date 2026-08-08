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
    { Icon: Sun,        label: 'AI Solar Score' },
    { Icon: Lightning,  label: 'Govt Subsidies' },
    { Icon: ChartBar,   label: 'ROI Calculator' },
    { Icon: Receipt,    label: 'Bill Scanner' },
    { Icon: MapPin,     label: 'Land Analysis' },
    { Icon: Storefront, label: 'Vendor Marketplace' },
  ];

  const statBadges = [
    '28 States & UTs Covered',
    'PM Surya Ghar 2024 Ready',
    'AI Model Chain Powered'
  ];

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '60px 24px 80px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '60px' }}>
          <img
            src="/logo.png"
            alt="SuryaSetu Logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, letterSpacing: '-0.02em' }}>
            Surya<span style={{ color: 'var(--color-ember-orange)' }}>Setu</span>
          </span>
        </div>

        {/* Hero Headline Block (Ventriloc 66px, 0.91 line-height, -1.32px tracking) */}
        <section style={{ marginBottom: '80px', maxWidth: '800px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 66px)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '-1.32px',
              color: 'var(--color-graphite)',
              marginBottom: '20px',
            }}
          >
            India's Solar Intelligence Observatory.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '18px',
              lineHeight: 1.4,
              color: 'var(--color-steel)',
              marginBottom: '32px',
              maxWidth: '640px',
            }}
          >
            Instant bill parsing, 25-year ROI modeling, DISCOM net-metering rules, and PM Surya Ghar subsidies unified under a Centralized Context Engine.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleRoleSelect('consumer')}
            >
              Start Free Assessment →
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => handleRoleSelect('business')}
            >
              For Solar Businesses
            </button>
          </div>
        </section>

        {/* Role Cards (Ventriloc Asymmetric Radius: 6px 0px 0px 6px in Ash #efefef) */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brass)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            Select Your Pathway
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {roles.map(({ role, Icon, title, desc, cta, isPrimary }) => (
              <div
                key={role}
                style={{
                  background: isPrimary ? 'var(--color-ash)' : 'var(--color-fog)',
                  borderRadius: '6px 0px 0px 6px',
                  padding: '40px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: isPrimary ? '1px solid var(--color-mist)' : '1px solid transparent',
                  transition: 'all 150ms ease',
                }}
                onClick={() => handleRoleSelect(role)}
              >
                <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--color-ember-orange)' }}>
                  <Icon size={28} weight="regular" />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-graphite)',
                    marginBottom: '10px',
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-steel)',
                    lineHeight: 1.6,
                    marginBottom: '28px',
                    flex: 1,
                  }}
                >
                  {desc}
                </p>

                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      color: 'var(--color-graphite)',
                      textDecoration: 'underline',
                      textDecorationColor: 'var(--color-ember-orange)',
                      textUnderlineOffset: '3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {cta} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Observatory Strip */}
        <section
          style={{
            padding: '32px 0',
            borderTop: '1px solid var(--color-mist)',
            borderBottom: '1px solid var(--color-mist)',
            marginBottom: '60px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'space-between', alignItems: 'center' }}>
            {features.map(({ Icon, label }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-steel)' }}>
                <Icon size={16} color="var(--color-ember-orange)" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Partner / Coverage Strip (Ventriloc Brass caption) */}
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-brass)', letterSpacing: '-0.02em' }}>
            Trusted by 80+ DISCOM frameworks &amp; installers across India
          </span>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {statBadges.map((badge, i) => (
              <span key={i} className="badge">
                {badge}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Landing;
