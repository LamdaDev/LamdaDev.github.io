import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'fr';

export const languageMetadata = {
  en: {
    title: 'Daniel Lam · Developer & curious human',
    description: 'Daniel Lam, software developer and Concordia Software Engineering Co-op student. Backend services, data pipelines, and thoughtful web and mobile applications.',
  },
  fr: {
    title: 'Daniel Lam · Développeur et esprit curieux',
    description: 'Daniel Lam, développeur et étudiant en génie logiciel au programme coop de Concordia. Services backend, pipelines de données et applications Web et mobiles bien pensées.',
  },
} as const;

export function languageFromPath(pathname: string): Language {
  return /^\/fr(?:\/|$)/.test(pathname) ? 'fr' : 'en';
}

export function languageHref(language: Language, hash = '', search = ''): string {
  const query = new URLSearchParams(search);
  // An explicit English link must also override a saved French preference on a fresh visit.
  if (language === 'en') query.set('lang', 'en');
  else query.delete('lang');
  const queryString = query.toString();
  return `${language === 'fr' ? '/fr/' : '/'}${queryString ? `?${queryString}` : ''}${hash}`;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  text: (english: string, french: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLanguage = 'en', children }: { initialLanguage?: Language; children: ReactNode }) {
  // Hydrate in the HTML's locale, then restore a saved preference on a plain root visit.
  const [language, updateLanguage] = useState<Language>(initialLanguage);
  const [preferenceReady, setPreferenceReady] = useState(false);

  const setLanguage = useCallback((nextLanguage: Language) => {
    if (typeof window !== 'undefined') {
      const nextUrl = languageHref(nextLanguage, window.location.hash, window.location.search);
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      if (nextUrl !== currentUrl) window.history.pushState(window.history.state, '', nextUrl);
    }
    updateLanguage(nextLanguage);
  }, []);

  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const explicitChoice = new URLSearchParams(search).get('lang');
    if (pathname === '/' && explicitChoice !== 'en') {
      let savedChoice: string | null = null;
      try { savedChoice = window.localStorage.getItem('daniel-language'); } catch { /* The URL still works without storage. */ }
      if (explicitChoice === 'fr' || savedChoice === 'fr') {
        window.history.replaceState(window.history.state, '', languageHref('fr', hash, search));
        updateLanguage('fr');
      }
    }
    setPreferenceReady(true);

    // Navigating through history follows the URL rather than reapplying a saved preference.
    const onHistoryChange = () => updateLanguage(languageFromPath(window.location.pathname));
    window.addEventListener('popstate', onHistoryChange);
    return () => window.removeEventListener('popstate', onHistoryChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = languageMetadata[language].title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', languageMetadata[language].description);
    // Wait until the saved preference has been read so initial EN cannot overwrite it.
    if (preferenceReady) {
      try { window.localStorage.setItem('daniel-language', language); } catch { /* Storage can be unavailable in private browsing. */ }
    }
  }, [language, preferenceReady]);

  const text = useCallback((english: string, french: string) => language === 'fr' ? french : english, [language]);
  const value = useMemo(() => ({ language, setLanguage, text }), [language, setLanguage, text]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
