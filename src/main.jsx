import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import './index.css';

// Show [DEV] in the browser tab when running locally.
const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(globalThis?.location?.hostname);
if (import.meta.env.DEV || isLocalHost) {
  document.title = 'Winbit App [DEV]';
}

// En dev, eliminar service workers y cachés viejos (evita servir assets/logos obsoletos).
if (import.meta.env.DEV && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => registrations.forEach((registration) => registration.unregister()))
    .catch(() => {});
  if (globalThis.caches?.keys) {
    globalThis.caches
      .keys()
      .then((keys) => keys.forEach((key) => globalThis.caches.delete(key)))
      .catch(() => {});
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
