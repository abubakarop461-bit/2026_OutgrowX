import React, { useState } from 'react';
import { useApp, Language } from '../context/AppContext';
import { Globe, Check } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'mr': return 'मराठी';
      default: return 'English';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        type="button"
        className="btn btn-ghost btn-sm" 
        onClick={toggleDropdown}
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '6px 12px', fontSize: '0.8125rem' }}
      >
        <Globe size={14} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div 
          className="glass-card" 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '0.5rem', 
            padding: '0.375rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '130px',
            zIndex: 150,
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {(['en', 'hi', 'mr'] as Language[]).map(lang => (
            <button 
              key={lang}
              type="button"
              className="btn btn-ghost btn-sm" 
              onClick={() => handleSelect(lang)} 
              style={{
                justifyContent: 'space-between',
                padding: '8px 12px',
                fontSize: '0.8125rem',
                color: language === lang ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: language === lang ? 'rgba(168,255,62,0.08)' : 'transparent'
              }}
            >
              <span>{getLanguageLabel(lang)}</span>
              {language === lang && <Check size={14} color="var(--accent-primary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
