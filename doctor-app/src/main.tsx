import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PatientSimulator } from './simulator/PatientSimulator';
import './styles/tokens.css';

const root = document.getElementById('root');
if (!root) throw new Error('Brak elementu #root');

createRoot(root).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).has('symulator') ? <PatientSimulator /> : <App />}
  </StrictMode>,
);
