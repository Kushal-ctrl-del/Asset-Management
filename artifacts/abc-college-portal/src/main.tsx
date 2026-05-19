import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hydrateAllSeeds } from './lib/storage.ts';

// Hydrate seed data into localStorage on initial load
hydrateAllSeeds();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
