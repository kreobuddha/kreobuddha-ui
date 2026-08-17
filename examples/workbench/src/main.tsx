import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from '@kreobuddha/ui';

// The library's stylesheet first, this application's layout second: the workbench styles page
// layout, which `docs/ARCHITECTURE.md` says the library deliberately does not publish tokens for.
import '@kreobuddha/ui/styles.css';
import './workbench.css';

import { App } from './App';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      {/* The provider wraps the application, because `save` raises its toast from inside `App`. */}
      <ToastProvider label="Console notifications">
        <App />
      </ToastProvider>
    </StrictMode>
  );
}
