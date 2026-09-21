import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './runtime/scene.css';
import { setRendererStatus } from './runtime/explorer';
import { initializeTheme } from './runtime/theme';
import './runtime/theme.css';
import './runtime/company-logos.css';
import './runtime/scene-props.css';
import './runtime/mobile.css';

initializeTheme();
const container = document.getElementById('root')!;
if (container.querySelector('main')) hydrateRoot(container, <App />);
else createRoot(container).render(<App />);

// WebGL remains outside the prerendered content tree and loads independently.
import('./runtime/mountScenes')
  .then(({ mountScenes }) => mountScenes())
  .catch(error => {
    setRendererStatus('unavailable');
    console.warn('3D scenes could not load; static previews remain available.', error);
  });
