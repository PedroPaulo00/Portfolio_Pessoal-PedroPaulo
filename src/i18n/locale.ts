/**
 * Idioma do site: a escolha salva do visitante ou, na primeira visita, o idioma
 * do navegador (português para pt-*, inglês para os demais).
 */
import type { Locale } from '../types/portfolio';

const LOCALE_KEY = 'portfolio-aero:lang';

/** Formatação de datas e números (Intl). */
export const intlLocale: Record<Locale, string> = { pt: 'pt-BR', en: 'en-US' };

export function getLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'pt' || stored === 'en') return stored;
  } catch {
    // Armazenamento bloqueado: segue pelo idioma do navegador.
  }
  const preferred = navigator.languages?.[0] ?? navigator.language ?? 'pt';
  return preferred.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function applyLocale(locale: Locale, persist = false): void {
  document.documentElement.lang = intlLocale[locale];
  if (!persist) return;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Sem armazenamento: vale só nesta visita.
  }
}
