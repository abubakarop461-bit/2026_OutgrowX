import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { User, Phone, EnvelopeSimple, ArrowRight, ShieldCheck } from '@phosphor-icons/react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { authenticateUser } = useApp();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      newErrors.phone = 'Valid 10-digit mobile number is required';
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    authenticateUser(formData.name.trim(), formData.phone.trim(), formData.email.trim());
    navigate('/onboarding');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-canvas-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo.png"
            alt="SuryaSetu Logo"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              marginBottom: '12px',
            }}
          />

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--color-graphite)',
              margin: 0,
            }}
          >
            Surya<span style={{ color: 'var(--color-ember-orange)' }}>Setu</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-steel)', margin: '6px 0 0' }}>
            India's Solar Intelligence Observatory
          </p>
        </div>

        {/* Auth Card (Ventriloc Ash container) */}
        <div
          style={{
            background: 'var(--color-ash)',
            borderRadius: 'var(--radius-cards)',
            padding: '32px 28px',
          }}
        >
          {/* Mode Switch (Ventriloc Pill Container) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--color-canvas-white)',
              padding: '4px',
              borderRadius: 'var(--radius-nav-pills)',
              marginBottom: '28px',
              border: '1px solid var(--color-mist)',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: 'var(--radius-nav-pills)',
                fontSize: '13px',
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                cursor: 'pointer',
                background: mode === 'signup' ? 'var(--color-graphite)' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : 'var(--color-slate)',
                transition: 'all 150ms ease',
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: 'var(--radius-nav-pills)',
                fontSize: '13px',
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                cursor: 'pointer',
                background: mode === 'signin' ? 'var(--color-graphite)' : 'transparent',
                color: mode === 'signin' ? '#ffffff' : 'var(--color-slate)',
                transition: 'all 150ms ease',
              }}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="auth-name"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--color-slate)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="var(--color-slate)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    paddingLeft: '36px',
                    borderColor: errors.name ? '#dc2626' : undefined,
                  }}
                  autoFocus
                />
              </div>
              {errors.name && <p style={{ fontSize: '12px', color: '#dc2626', margin: '4px 0 0' }}>{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="auth-phone"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--color-slate)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  color="var(--color-slate)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="auth-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    paddingLeft: '36px',
                    borderColor: errors.phone ? '#dc2626' : undefined,
                  }}
                  maxLength={10}
                />
              </div>
              {errors.phone && <p style={{ fontSize: '12px', color: '#dc2626', margin: '4px 0 0' }}>{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--color-slate)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <EnvelopeSimple
                  size={16}
                  color="var(--color-slate)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    paddingLeft: '36px',
                    borderColor: errors.email ? '#dc2626' : undefined,
                  }}
                />
              </div>
              {errors.email && <p style={{ fontSize: '12px', color: '#dc2626', margin: '4px 0 0' }}>{errors.email}</p>}
            </div>

            {/* Submit Button (Ventriloc 0px primary CTA) */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
              }}
            >
              {mode === 'signup' ? 'Continue to Onboarding' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footnote */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-mist)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--color-slate)',
            }}
          >
            <ShieldCheck size={16} color="var(--color-brass)" style={{ flexShrink: 0 }} />
            <span>Encrypted locally on your device for accurate subsidy &amp; ROI modeling.</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Auth;
