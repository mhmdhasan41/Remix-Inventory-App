import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';
import { cacheRtl } from './theme/theme';
import { AppThemeProvider } from './theme/ThemeContext';

// Register global error catchers to gracefully prevent background Firestore sync permission errors from crashing the UI
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    (event.reason.message && event.reason.message.includes('Firestore Error')) ||
    String(event.reason).includes('Missing or insufficient permissions')
  )) {

    event.preventDefault(); // Prevent crashing the page or triggering full-screen error overlays
  }
});

window.addEventListener('error', (event) => {
  if (event.error && (
    (event.error.message && event.error.message.includes('Firestore Error')) ||
    event.message.includes('Missing or insufficient permissions')
  )) {

    event.preventDefault(); // Prevent crashing the page or triggering full-screen error overlays
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={cacheRtl}>
      <AppThemeProvider>
        <CssBaseline />
        <App />
      </AppThemeProvider>
    </CacheProvider>
  </StrictMode>,
);
