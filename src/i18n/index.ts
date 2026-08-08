import { useApp } from '../context/AppContext';
import en from './en';
import hi from './hi';
import mr from './mr';

const translations = {
  en,
  hi,
  mr
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () => {
  const { language } = useApp();

  const currentLang = (language || 'en').toLowerCase() as keyof typeof translations;
  const dict = translations[currentLang] || translations.en;

  const t = (key: TranslationKeys | string): string => {
    try {
      return (dict as any)?.[key] || (en as any)?.[key] || String(key);
    } catch {
      return String(key);
    }
  };

  return { t, dict };
};
