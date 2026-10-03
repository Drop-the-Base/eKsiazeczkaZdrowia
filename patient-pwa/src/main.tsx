import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { leaveStaleServiceWorker } from './app/staleServiceWorker';
import './ui/tokens.css';

const root = document.getElementById('root');
if (!root) throw new Error('Brak elementu #root');

void leaveStaleServiceWorker()
  .then((reloading) => {
    if (reloading) return;
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((err: unknown) => console.error('Nie udało się uruchomić aplikacji', err));
