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
