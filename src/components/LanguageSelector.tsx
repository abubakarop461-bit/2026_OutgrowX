import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp, Language } from '../context/AppContext';
import { Globe, Check } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  ];

  const toggleDropdown = () => setIsOpen(prev => !prev);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    closeDropdown();
    buttonRef.current?.focus();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      closeDropdown();
      buttonRef.current?.focus();
    }
  }, [isOpen, closeDropdown]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      closeDropdown();
    }
  }, [closeDropdown]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      closeDropdown();
    }
    if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const firstItem = dropdownRef.current?.querySelector('button') as HTMLButtonElement;
      firstItem?.focus();
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, lang: Language, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(lang);
    }
    if (e.key === 'Escape') {
      closeDropdown();
      buttonRef.current?.focus();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextItem = dropdownRef.current?.querySelectorAll('button')[index + 1] as HTMLButtonElement;
      nextItem?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        buttonRef.current?.focus();
      } else {
        const prevItem = dropdownRef.current?.querySelectorAll('button')[index - 1] as HTMLButtonElement;
        prevItem?.focus();
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-ghost btn-sm flex items-center gap-1"
        onClick={toggleDropdown}
        onKeyDown={handleButtonKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language, current: ${language.toUpperCase()}`}
        style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
      >
        <Globe size={14} className="text-accent" />
        <span className="font-semibold text-primary">{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div
          className="glass-card flex-col gap-1"
          role="listbox"
          aria-label="Select language"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            padding: '0.375rem',
            minWidth: '140px',
            zIndex: 150,
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              className="btn btn-ghost btn-sm justify-between"
              onClick={() => handleSelect(lang.code)}
              onKeyDown={(e) => handleOptionKeyDown(e, lang.code, index)}
              style={{
                padding: '8px 12px',
                fontSize: '0.8125rem',
                color: language === lang.code ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: language === lang.code ? 'rgba(168,255,62,0.08)' : 'transparent'
              }}
            >
              <span>{lang.nativeLabel}</span>
              {language === lang.code && <Check size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
