import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp, Language } from '../context/AppContext';
import { Check, Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'EN', nativeLabel: 'English' },
    { code: 'hi', label: 'HI', nativeLabel: 'हिंदी' },
    { code: 'mr', label: 'MR', nativeLabel: 'मराठी' },
  ];

  const toggleDropdown = () => setIsOpen(prev => !prev);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    closeDropdown();
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      closeDropdown();
    }
  }, [closeDropdown]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-slate)',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          letterSpacing: '-0.02em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
        }}
      >
        <Globe size={13} />
        <span>{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--color-canvas-white)',
            border: '1px solid var(--color-mist)',
            borderRadius: 'var(--radius-cards)',
            padding: '4px',
            minWidth: '130px',
            zIndex: 150,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                border: 'none',
                background: language === lang.code ? 'var(--color-fog)' : 'transparent',
                color: language === lang.code ? 'var(--color-ember-orange)' : 'var(--color-graphite)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{lang.nativeLabel}</span>
              {language === lang.code && <Check size={13} color="var(--color-ember-orange)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
