// src/main.jsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import GeneralErrorBoundary from './components/Pages/Errors/GeneralErrorBoundary';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GeneralErrorBoundary>
        <App />
      </GeneralErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);

// ⬇️ Enregistrement du SW seulement en production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => {
        console.log('Service Worker enregistré avec succès:', reg.scope);
      })
      .catch(err => {
        console.error('Erreur lors de l’enregistrement du SW :', err);
      });
  });
}
