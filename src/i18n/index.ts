import { useApp } from '../context/AppContext';
import en from './en';
import hi from './hi';
import mr from './mr';

const translations = {
  en,
  hi,
  mr
};

export const useTranslation = () => {
  const { language } = useApp();
  
  // Return the selected language object, fallback to 'en'
  const t = translations[language] || translations.en;
  
  return { t };
};
