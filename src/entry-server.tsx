import { renderToString } from 'react-dom/server';
import App from './App';
import type { Language } from './i18n';

export function render(language: Language = 'en') {
  return renderToString(<App initialLanguage={language} />);
}
