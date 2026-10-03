import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './runtime/scene.css';
import { setRendererStatus } from './runtime/explorer';
import { initializeTheme } from './runtime/theme';
import { languageFromPath } from './i18n';
import './runtime/theme.css';
import './runtime/company-logos.css';
import './runtime/scene-props.css';
import './runtime/mobile.css';
import './runtime/preferences.css';

initializeTheme();
const initialLanguage = languageFromPath(window.location.pathname);
const container = document.getElementById('root')!;
if (container.querySelector('main')) hydrateRoot(container, <App initialLanguage={initialLanguage} />);
else createRoot(container).render(<App initialLanguage={initialLanguage} />);

// WebGL remains outside the prerendered content tree and loads independently.
import('./runtime/mountScenes')
  .then(({ mountScenes }) => mountScenes())
  .catch(error => {
    setRendererStatus('unavailable');
    console.warn('3D scenes could not load; static previews remain available.', error);
  });
