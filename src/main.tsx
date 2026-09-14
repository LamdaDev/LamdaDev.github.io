import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './runtime/scene.css';

const container = document.getElementById('root')!;
if (container.querySelector('main')) hydrateRoot(container, <App />);
else createRoot(container).render(<App />);

// WebGL remains outside the prerendered content tree and loads independently.
import('./runtime/mountScenes')
  .then(({ mountScenes }) => mountScenes())
  .catch(error => console.warn('3D scenes could not load; static previews remain available.', error));
