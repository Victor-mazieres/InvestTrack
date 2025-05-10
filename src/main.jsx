// src/main.jsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import GeneralErrorBoundary from './components/Pages/Errors/GeneralErrorBoundary';

// Crée une instance de QueryClient pour React Query
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
