import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

// Stub if context not built yet
const useApp = () => ({
  profile: { firstName: 'User' }
});

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useApp();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Solar AI', path: '/solar-ai' },
    { name: 'Property', path: '/property' },
    { name: 'Report', path: '/report' },
    { name: 'Marketplace', path: '/marketplace' },
  ];

  return (
    <nav className="glass-card" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem',
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V2M12 22v-2M4 12H2m20 0h-2m-2.05-6.95l1.41-1.41M4.64 19.36l1.41-1.41m13.31 0l-1.41-1.41M4.64 4.64l1.41 1.41" stroke="#A8FF3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" fill="#A8FF3E"/>
          <path d="M12 16c-2 0-3 1-3 3 0 1.5 1 2 3 2s3-.5 3-2c0-2-1-3-3-3z" fill="#A8FF3E"/>
        </svg>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Outfit' }}>SuryX</span>
      </div>

      {/* Desktop Links */}
      <div className="desktop-links" style={{ display: 'flex', gap: '2rem' }}>
        {navLinks.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path}
            style={({ isActive }) => ({
              color: isActive ? '#A8FF3E' : 'inherit',
              textDecoration: 'none',
              borderBottom: isActive ? '2px solid #A8FF3E' : '2px solid transparent',
              paddingBottom: '0.25rem',
              fontWeight: 500
            })}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LanguageSelector />
        <div className="desktop-greeting" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8BAF95' }}>
          <span>Hi, {profile?.firstName || 'User'}</span>
        </div>
        <button className="mobile-menu-btn btn btn-ghost" onClick={toggleMobileMenu} style={{ padding: '0.5rem' }}>
          ☰
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="glass-card mobile-menu" style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                color: isActive ? '#A8FF3E' : 'inherit',
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                borderLeft: isActive ? '3px solid #A8FF3E' : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(168, 255, 62, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 400
              })}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}

      {/* Inline styles for media query equivalent */}
      <style>
        {`
          .mobile-menu-btn { display: none; }
          @media (max-width: 768px) {
            .desktop-links { display: none !important; }
            .desktop-greeting { display: none !important; }
            .mobile-menu-btn { display: flex; }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
