import { useEffect, useState } from 'react';
import { toggleTheme, useTheme } from '../runtime/theme';
import { useLanguage } from '../i18n';

/** A stable toggle label lets assistive technology announce its on/off state. */
export function ThemeButton({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const theme = useTheme();
  const { text } = useLanguage();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return <button
    className={`theme-button${compact ? ' theme-button--compact' : ''}${className ? ` ${className}` : ''}`}
    type="button"
    aria-label={text('Night shift', 'Mode nuit')}
    aria-pressed={theme === 'night'}
    title={theme === 'night' ? text('Switch to day lighting', 'Passer à l’éclairage de jour') : text('Switch to night shift lighting', 'Passer à l’éclairage de nuit')}
    disabled={!ready}
    onClick={toggleTheme}
  >
    <span className="theme-button-icons" aria-hidden="true">
      <svg className="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg className="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.1 14.5A8.5 8.5 0 0 1 9.5 3.9 8.5 8.5 0 1 0 20.1 14.5Z" /><path d="M18 2v4m-2-2h4" /></svg>
    </span>
    <span className="theme-button-label" aria-hidden="true">{text('Night shift', 'Mode nuit')}</span>
  </button>;
}
