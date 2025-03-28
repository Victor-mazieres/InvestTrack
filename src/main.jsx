// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import GeneralErrorBoundary from './components/Pages/Errors/GeneralErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GeneralErrorBoundary>
      <App />
    </GeneralErrorBoundary>
  </StrictMode>,
);