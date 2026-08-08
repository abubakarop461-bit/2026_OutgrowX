import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sun, User, Phone, EnvelopeSimple, ArrowRight, ShieldCheck, CheckCircle
} from '@phosphor-icons/react';

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
        background: '#070D09',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(168,255,62,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(168,255,62,0.10)',
              border: '1px solid rgba(168,255,62,0.22)',
              marginBottom: '0.875rem',
            }}
          >
            <Sun size={26} weight="duotone" color="#A8FF3E" />
          </div>

          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '2.25rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#ECF2EE',
              margin: 0,
            }}
          >
            Surya<span style={{ color: '#A8FF3E' }}>Setu</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7A9484', margin: '0.5rem 0 0' }}>
            India's AI Solar Intelligence Platform
          </p>
        </div>

        {/* Auth Glass Card */}
        <div
          style={{
            background: 'rgba(10, 18, 13, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2rem 1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Mode Switch Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                padding: '0.625rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'signup' ? 'rgba(168,255,62,0.15)' : 'transparent',
                color: mode === 'signup' ? '#A8FF3E' : '#7A9484',
                transition: 'all 150ms ease',
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              style={{
                padding: '0.625rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'signin' ? 'rgba(168,255,62,0.15)' : 'transparent',
                color: mode === 'signin' ? '#A8FF3E' : '#7A9484',
                transition: 'all 150ms ease',
              }}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Field 1: Full Name */}
            <div>
              <label
                htmlFor="auth-name"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#7A9484',
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  weight="duotone"
                  color="#7A9484"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.625rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: errors.name ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: '#ECF2EE',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
              </div>
              {errors.name && <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '4px 0 0' }}>{errors.name}</p>}
            </div>

            {/* Field 2: Phone Number */}
            <div>
              <label
                htmlFor="auth-phone"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#7A9484',
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Mobile Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={18}
                  weight="duotone"
                  color="#7A9484"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="auth-phone"
                  type="tel"
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.625rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: errors.phone ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: '#ECF2EE',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  maxLength={10}
                />
              </div>
              {errors.phone && <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '4px 0 0' }}>{errors.phone}</p>}
            </div>

            {/* Field 3: Email Address */}
            <div>
              <label
                htmlFor="auth-email"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#7A9484',
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <EnvelopeSimple
                  size={18}
                  weight="duotone"
                  color="#7A9484"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="your.name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.625rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: errors.email ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: '#ECF2EE',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {errors.email && <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '4px 0 0' }}>{errors.email}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.5rem',
                padding: '0.875rem',
                fontSize: '0.9375rem',
                gap: '8px',
              }}
            >
              {mode === 'signup' ? 'Continue to Onboarding' : 'Sign In & Continue'}
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>

          {/* Privacy Footnote */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.75rem',
              color: '#4A6055',
            }}
          >
            <ShieldCheck size={16} weight="duotone" color="#22C55E" style={{ flexShrink: 0 }} />
            <span>Your information is encrypted &amp; used only for subsidy &amp; ROI calculations.</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Auth;
