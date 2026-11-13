import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import { inject } from '@vercel/analytics';
import { App } from './App';
import { I18nProvider } from './i18n/I18n';
import { applyLocale, getLocale } from './i18n/locale';
import { applyGlassMode, applyTheme, getGlassMode, getTheme } from './lib/preferences';

// Antes do primeiro render: evita trocar tema/vidro/idioma depois de pintar o interior.
applyTheme(getTheme());
applyGlassMode(getGlassMode());
applyLocale(getLocale());

// Estatísticas sem cookies (Vercel Web Analytics). A contagem de páginas é feita
// pelo App a cada seção (o # da URL não é visto como página pela contagem automática).
// Em desenvolvimento, só registra no console.
inject({ mode: import.meta.env.PROD ? 'production' : 'development', disableAutoTrack: true });

const root = document.getElementById('root');
if (!root) throw new Error('#root not found in index.html.');

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
