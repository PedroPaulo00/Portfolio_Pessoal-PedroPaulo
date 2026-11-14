/**
 * Preferências do visitante: tema do interior e modo de vidro da moldura.
 * São independentes (seções 6 e 7G do kit). Armazenamento é opcional: em modo
 * privado ou com storage bloqueado, a escolha vale só para a sessão.
 */

export type Theme = 'light' | 'dark';
export type GlassMode = 'blur' | 'clear' | 'opaque';

const THEME_KEY = 'portfolio-aero:theme';
const GLASS_KEY = 'portfolio-aero:glass';

const THEMES: readonly Theme[] = ['light', 'dark'];
const GLASS_MODES: readonly GlassMode[] = ['blur', 'clear', 'opaque'];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sem armazenamento: mantém apenas na sessão */
  }
}

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.find((item) => item === value) ?? fallback;
}

export function getTheme(): Theme {
  return pick(read(THEME_KEY), THEMES, 'light');
}

/**
 * Vidro padrão (sem escolha salva): com desfoque, como o Aero do Windows 7, em
 * telas de computador; em celular/tablet, translúcido sem desfoque, que é mais
 * leve para rolar. O visitante pode trocar em Aparência.
 */
function defaultGlassMode(): GlassMode {
  const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 64em) and (hover: hover)').matches;
  return desktop && supportsBackdropBlur() ? 'blur' : 'clear';
}

export function getGlassMode(fallback: GlassMode = defaultGlassMode()): GlassMode {
  const stored = pick(read(GLASS_KEY), GLASS_MODES, fallback);
  // Sem suporte a backdrop-filter, "blur" degrada para translúcido sem blur (seção 6).
  return stored === 'blur' && !supportsBackdropBlur() ? 'clear' : stored;
}

export function supportsBackdropBlur(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'))
  );
}

/** Aplica no <html>. Os tokens de tema e vidro reagem aos atributos data-*. */
export function applyTheme(theme: Theme, persist = false): void {
  document.documentElement.dataset.theme = theme;
  if (persist) write(THEME_KEY, theme);
}

export function applyGlassMode(mode: GlassMode, persist = false): void {
  document.documentElement.dataset.glass = mode;
  if (persist) write(GLASS_KEY, mode);
}
