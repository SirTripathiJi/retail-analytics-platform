import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Safe fallback if used outside provider
    return {
      t: (key, defaultText) => defaultText ?? key,
      lang: 'en',
      changeLanguage: () => {},
      LANGS: ['en'],
      LANG_NAMES: { en: 'English' },
    };
  }
  return context;
};

export const useTranslation = useLanguage;

// Dynamically import all JSON locales
const modules = import.meta.glob('../locales/*.json', { eager: true });
const ALL = {};
for (const path in modules) {
  const lang = path.match(/\/([^/]+)\.json$/)[1];
  ALL[lang] = modules[path].default || modules[path];
}

export const LANG_NAMES = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  ur: 'اردو',
};

// Helper to resolve nested keys like "nav.inventory"
const resolvePath = (obj, path) => {
  return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('arth_lang');
    if (saved && ALL[saved]) setLang(saved);
  }, []);

  const changeLanguage = (l) => {
    if (!ALL[l]) return;
    setLang(l);
    localStorage.setItem('arth_lang', l);
  };

  const t = (key, defaultText) => {
    const translation = resolvePath(ALL[lang], key) ?? resolvePath(ALL['en'], key);
    return translation ?? defaultText ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{ lang, changeLanguage, t, LANGS: Object.keys(ALL), LANG_NAMES }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
