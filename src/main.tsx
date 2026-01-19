import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FlagProvider } from '@unleash/proxy-client-react'

// Configuración de Unleash desde window (inyectada por config.js)
declare global {
  interface Window {
    UNLEASH_CONFIG?: {
      url: string;
      clientKey: string;
      appName: string;
    };
  }
}

const unleashConfig = {
  url: window.UNLEASH_CONFIG?.url || import.meta.env.VITE_UNLEASH_URL || '',
  clientKey: window.UNLEASH_CONFIG?.clientKey || import.meta.env.VITE_UNLEASH_CLIENT_KEY || '',
  appName: window.UNLEASH_CONFIG?.appName || import.meta.env.VITE_UNLEASH_APP_NAME || 'frontend-medical-record',
};

console.log('🚀 Inicializando Unleash...');
console.log('📍 URL:', unleashConfig.url);
console.log('📍 Client Key:', unleashConfig.clientKey ? '***' + unleashConfig.clientKey.slice(-8) : 'MISSING');
console.log('📍 App Name:', unleashConfig.appName);

// Renderizar la app envuelta en el FlagProvider de Unleash
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlagProvider config={unleashConfig}>
      <App />
    </FlagProvider>
  </StrictMode>,
);

