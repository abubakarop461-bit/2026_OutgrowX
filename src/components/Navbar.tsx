import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LanguageSelector from './LanguageSelector';
import { Sun, Menu, X, RotateCcw, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userProfile, resetProfile } = useApp();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleReset = () => {
    if (window.confirm("Do you want to reset your profile and re-run onboarding?")) {
      resetProfile();
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Solar AI', path: '/solar-ai' },
    { name: 'Property', path: '/property' },
    { name: 'Report', path: '/report' },
    { name: 'Marketplace', path: '/marketplace' },
  ];

  const userName = userProfile.firstName || userProfile.name || 'User';

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0,
      right: 0,
      height: '64px',
      zIndex: 100, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '0 2rem',
      background: 'rgba(7, 13, 9, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Logo */}
      <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168,255,62,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,255,62,0.25)'
        }}>
          <Sun size={18} color="#A8FF3E" />
        </div>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#F0FFF4' }}>
          Sury<span style={{ color: '#A8FF3E' }}>X</span>
        </span>
      </NavLink>

      {/* Desktop Links */}
      <div className="desktop-links" style={{ display: 'flex', gap: '0.5rem' }}>
        {navLinks.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path}
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: isActive ? 'rgba(168, 255, 62, 0.08)' : 'transparent',
              borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LanguageSelector />
        
        <div className="desktop-greeting" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <User size={14} color="var(--accent-primary)" />
          <span style={{ fontWeight: 500, color: '#F0FFF4' }}>{userName}</span>
          {userProfile.state && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({userProfile.state})</span>
          )}
        </div>

        <button 
          title="Re-run Onboarding / Reset Profile"
          className="btn btn-ghost btn-sm" 
          onClick={handleReset}
          style={{ padding: '6px 10px', color: 'var(--text-muted)' }}
        >
          <RotateCcw size={14} />
        </button>

        <button className="mobile-menu-btn btn btn-ghost" onClick={toggleMobileMenu} style={{ padding: '6px', borderRadius: '8px' }}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="glass-card mobile-menu" style={{ 
          position: 'absolute', 
          top: '64px', 
          left: 0, 
          right: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '0.75rem',
          borderRadius: 0,
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(13, 26, 16, 0.95)',
          boxShadow: 'var(--shadow-card)'
        }}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
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
            className="btn btn-ghost" 
            onClick={() => { setMobileMenuOpen(false); handleReset(); }} 
            style={{ justifyContent: 'flex-start', marginTop: '0.5rem', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={14} /> Reset Profile / Re-run Onboarding
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
