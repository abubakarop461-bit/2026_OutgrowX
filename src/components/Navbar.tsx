import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import LanguageSelector from './LanguageSelector';
import { Sun, Menu, X, RotateCcw, User } from 'lucide-react';

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
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-8"
      style={{
        height: '64px',
        zIndex: 100,
        background: 'rgba(7, 13, 9, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <NavLink to="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '32px', height: '32px', background: 'rgba(168,255,62,0.12)',
            border: '1px solid rgba(168,255,62,0.25)'
          }}
        >
          <Sun size={18} className="text-accent" />
        </div>
        <span className="font-bold text-primary" style={{ fontSize: '1.375rem', fontFamily: 'var(--font-display)' }}>
          Surya<span className="text-accent">Setu</span>
        </span>
      </NavLink>

      {/* Desktop Links */}
      <div className="desktop-links flex gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className="transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: isActive ? 'rgba(168, 255, 62, 0.08)' : 'transparent',
              borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
            })}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <LanguageSelector />

        <div className="desktop-greeting flex items-center gap-2 text-secondary text-sm">
          <User size={14} className="text-accent" />
          <span className="font-medium text-primary">{userName}</span>
          {userProfile.state && (
            <span className="text-xs text-muted">({userProfile.state})</span>
          )}
        </div>

        <button
          title="Re-run Onboarding / Reset Profile"
          className="btn btn-ghost btn-sm"
          onClick={handleReset}
          aria-label="Reset profile and re-run onboarding"
          style={{ padding: '6px 10px', color: 'var(--text-muted)' }}
        >
          <RotateCcw size={14} />
        </button>

        <button
          className="mobile-menu-btn btn btn-ghost"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          style={{ padding: '6px', borderRadius: '8px' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="glass-card mobile-menu flex-col p-3"
          role="menu"
          aria-label="Mobile navigation"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(13, 26, 16, 0.95)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMobileMenu}
              className="transition-colors"
              role="menuitem"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'rgba(168, 255, 62, 0.08)' : 'transparent',
                fontWeight: isActive ? 600 : 400
              })}
            >
              {link.name}
            </NavLink>
          ))}
          <button
            className="btn btn-ghost mt-2 justify-start"
            onClick={handleReset}
            role="menuitem"
            style={{ color: 'var(--text-muted)' }}
          >
            <RotateCcw size={14} /> Reset Profile
          </button>
        </div>
      )}

      <style>{`
        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .desktop-greeting { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
