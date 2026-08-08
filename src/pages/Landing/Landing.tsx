import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import {
  House, Plant, Buildings, Sun, Lightning, ChartBar, Receipt, MapPin, Storefront, ArrowRight, CheckCircle, Globe
} from '@phosphor-icons/react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole, isAuthenticated } = useApp();
  const { t } = useTranslation();

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
      title: t('roleConsumerTitle'),
      desc: t('roleConsumerDesc'),
      cta: t('roleConsumerCta'),
      isPrimary: true,
    },
    {
      role: 'landowner' as UserRole,
      Icon: Plant,
      title: t('roleLandownerTitle'),
      desc: t('roleLandownerDesc'),
      cta: t('roleLandownerCta'),
      isPrimary: false,
    },
    {
      role: 'business' as UserRole,
      Icon: Buildings,
      title: t('roleBusinessTitle'),
      desc: t('roleBusinessDesc'),
      cta: t('roleBusinessCta'),
      isPrimary: false,
    },
  ];

  const features = [
    { Icon: Sun,        label: t('solarScore'),          color: '#A8FF3E' },
    { Icon: Lightning,  label: t('subsidyEligible'),     color: '#F59E0B' },
    { Icon: ChartBar,   label: t('monthlySavings'),      color: '#A8FF3E' },
    { Icon: Receipt,    label: t('scanBill'),            color: '#A8FF3E' },
    { Icon: MapPin,     label: t('propertyAssessment'), color: '#60A5FA' },
    { Icon: Storefront, label: t('marketplace'),        color: '#A78BFA' },
  ];

  const statBadges = [
    { Icon: Globe,        label: t('statsStates') },
    { Icon: CheckCircle,  label: t('statsGovt') },
    { Icon: Sun,          label: t('statsAI')  },
  ];

  return (
    <main className="page--static page--static-centered" style={{ padding: '2rem 1rem' }}>

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
          <img
            src="/logo.png"
            alt="SuryaSetu Logo"
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(255,183,3,0.4))'
            }}
          />
          <h1 style={{
            fontSize: '2.25rem', fontFamily: 'Outfit, sans-serif',
            fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#ECF2EE',
          }}>
            Surya<span style={{ color: '#A8FF3E' }}>Setu</span>
          </h1>
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 400, color: '#7A9484', margin: '0.375rem 0 0' }}>
          {t('landingHeroSubtitle')}
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#4A6055', marginTop: '0.25rem' }}>
          {t('landingHeroTagline')}
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
          >
            <div style={{
              width: 52, height: 52, borderRadius: '12px',
              background: isPrimary ? 'rgba(168,255,62,0.12)' : 'rgba(255,255,255,0.05)',
              border: isPrimary ? '1px solid rgba(168,255,62,0.25)' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <Icon size={26} color={isPrimary ? '#A8FF3E' : '#7A9484'} />
            </div>

            <h3 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem',
              color: '#ECF2EE', margin: '0 0 0.5rem',
            }}>
              {title}
            </h3>

            <p style={{
              fontSize: '0.8125rem', color: '#7A9484', lineHeight: 1.5,
              margin: '0 0 1.5rem', flexGrow: 1,
            }}>
              {desc}
            </p>

            <button
              type="button"
              className={isPrimary ? 'btn btn-primary w-full' : 'btn btn-secondary w-full'}
              style={{
                borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                padding: '0.625rem 1rem',
              }}
            >
              {cta} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Feature Strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem',
        marginTop: '2rem', maxWidth: '900px', width: '100%', position: 'relative', zIndex: 10,
      }}>
        {features.map(({ Icon, label, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.75rem', color: '#7A9484',
          }}>
            <Icon size={14} color={color} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer Badges */}
      <footer style={{
        marginTop: '2.5rem', textAlign: 'center', position: 'relative', zIndex: 10,
      }}>
        <p style={{ fontSize: '0.75rem', color: '#4A6055', marginBottom: '0.75rem' }}>
          {t('footerTagline')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
          {statBadges.map(({ Icon, label }) => (
            <span key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.625rem', borderRadius: '999px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              fontSize: '0.6875rem', color: '#7A9484',
            }}>
              <Icon size={12} color="#A8FF3E" />
              {label}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default Landing;
