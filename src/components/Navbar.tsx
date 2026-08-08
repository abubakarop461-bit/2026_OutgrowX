import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import LanguageSelector from './LanguageSelector';
import { Menu, X, RotateCcw, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userProfile, resetProfile } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  }, [mobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleReset = () => {
    closeMobileMenu();
    if (window.confirm('Do you want to reset your profile and re-run onboarding?')) {
      resetProfile();
      navigate('/');
    }
  };

  const safeT = (key: string, fallback: string) => {
    try {
      if (typeof t === 'function') {
        const val = t(key);
        if (val && val !== key) return val;
      }
    } catch (e) {
      console.warn(e);
    }
    return fallback;
  };

  const navLinks = [
    { name: safeT('dashboard', 'Dashboard'), path: '/dashboard' },
    { name: safeT('solarAI', 'Solar AI'), path: '/solar-ai' },
    { name: safeT('propertyAssessment', 'Property'), path: '/property' },
    { name: safeT('aiReport', 'Report'), path: '/report' },
    { name: safeT('marketplace', 'Marketplace'), path: '/marketplace' },
  ];

  const userName = userProfile.firstName || userProfile.name || 'User';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-canvas-white)',
        borderBottom: '1px solid var(--color-mist)',
        padding: '12px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      aria-label="Main navigation"
    >
      {/* Brand Wordmark (Left) */}
      <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src="/logo.png"
          alt="SuryaSetu Logo"
          style={{
            height: '32px',
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'var(--color-graphite)',
          }}
        >
          Surya<span style={{ color: 'var(--color-ember-orange)' }}>Setu</span>
        </span>
      </NavLink>

      {/* Floating Pill Nav Container (Center) */}
      <nav
        className="desktop-links"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--color-ash)',
          borderRadius: 'var(--radius-nav-pills)',
          padding: '5px 8px',
        }}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-graphite)' : 'var(--color-slate)',
              textDecoration: 'none',
              padding: '6px 16px',
              borderRadius: 'var(--radius-nav-pills)',
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              background: isActive ? 'var(--color-canvas-white)' : 'transparent',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease',
            })}
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <LanguageSelector />

        <div className="desktop-greeting" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-steel)' }}>
          <User size={14} color="var(--color-slate)" />
          <span style={{ fontWeight: 500, color: 'var(--color-graphite)' }}>{userName}</span>
          {userProfile.state && (
            <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>({userProfile.state})</span>
          )}
        </div>

        <button
          title="Reset Profile / Re-onboard"
          className="btn-ghost btn-sm"
          onClick={handleReset}
          aria-label="Reset profile"
          style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--color-slate)', borderColor: 'var(--color-mist)' }}
        >
          <RotateCcw size={13} />
        </button>

        <button
          className="mobile-menu-btn btn-ghost"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          style={{ padding: '6px', display: 'none' }}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="menu"
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: 'var(--color-canvas-white)',
            borderBottom: '1px solid var(--color-mist)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMobileMenu}
              role="menuitem"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-ember-orange)' : 'var(--color-graphite)',
                textDecoration: 'none',
                padding: '8px 12px',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '-0.02em',
              })}
            >
              {link.name}
            </NavLink>
          ))}
          <button
            className="btn-ghost btn-sm"
            onClick={handleReset}
            role="menuitem"
            style={{ marginTop: '8px', justifyContent: 'flex-start' }}
          >
            <RotateCcw size={13} /> Reset Profile
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .desktop-greeting { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
