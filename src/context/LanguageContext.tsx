import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { id } from '../locales/id';

type Language = 'id' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'id' || saved === 'en')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('language', l);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    const dictionary = lang === 'id' ? id : en;
    const keys = key.split('.');
    let value: any = dictionary;
    
    for (const k of keys) {
      if (value[k] === undefined) {
        return key; // Fallback to key if not found
      }
      value = value[k];
    }
    
    if (typeof value !== 'string') return key;

    let translated = value;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translated = translated.replace(`{{${k}}}`, String(v));
      });
    }
    return translated;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
