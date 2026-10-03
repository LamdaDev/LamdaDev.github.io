import { useEffect, useState, type MouseEvent } from 'react';
import { languageHref, useLanguage, type Language } from '../i18n';

export function LanguageToggle() {
  const { language, setLanguage, text } = useLanguage();
  const [locationSuffix, setLocationSuffix] = useState({ hash: '', search: '' });

  useEffect(() => {
    const updateLinks = () => setLocationSuffix({ hash: window.location.hash, search: window.location.search });
    updateLinks();
    window.addEventListener('hashchange', updateLinks);
    window.addEventListener('popstate', updateLinks);
    return () => {
      window.removeEventListener('hashchange', updateLinks);
      window.removeEventListener('popstate', updateLinks);
    };
  }, []);

  function changeLanguage(event: MouseEvent<HTMLAnchorElement>, nextLanguage: Language) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setLanguage(nextLanguage);
    setLocationSuffix({ hash: window.location.hash, search: window.location.search });
  }

  return <nav className="language-toggle" aria-label={text('Website language', 'Langue du site')}>
    <a className="language-option" href={languageHref('en', locationSuffix.hash, locationSuffix.search)} lang="en" hrefLang="en" aria-label="English" aria-current={language === 'en' ? 'true' : undefined} onClick={event => changeLanguage(event, 'en')}>EN</a>
    <a className="language-option" href={languageHref('fr', locationSuffix.hash, locationSuffix.search)} lang="fr" hrefLang="fr" aria-label="Français" aria-current={language === 'fr' ? 'true' : undefined} onClick={event => changeLanguage(event, 'fr')}>FR</a>
  </nav>;
}
