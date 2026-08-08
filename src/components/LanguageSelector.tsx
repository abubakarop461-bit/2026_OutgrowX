import React, { useState } from 'react';

// Stub if context not built yet
const useApp = () => ({
  language: 'EN',
  setLanguage: (lang: string) => {},
});

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (lang: string) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'EN': return 'English';
      case 'HI': return 'हिंदी';
      case 'MR': return 'मराठी';
      default: return 'English';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-ghost" 
        onClick={toggleDropdown}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        🌐 <span>{language}</span>
      </button>

      {isOpen && (
        <div 
          className="glass-card" 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '0.5rem', 
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '120px',
            zIndex: 50
          }}
        >
          <button className="btn btn-ghost" onClick={() => handleSelect('EN')} style={{ justifyContent: 'flex-start' }}>English</button>
          <button className="btn btn-ghost" onClick={() => handleSelect('HI')} style={{ justifyContent: 'flex-start' }}>हिंदी</button>
          <button className="btn btn-ghost" onClick={() => handleSelect('MR')} style={{ justifyContent: 'flex-start' }}>मराठी</button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
