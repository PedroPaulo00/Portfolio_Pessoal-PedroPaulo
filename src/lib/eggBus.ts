/**
 * Barramento dos efeitos de tela dos easter eggs. Qualquer parte do site chama
 * `playEffect('snow')`: a conquista é desbloqueada e a camada de efeitos
 * (components/eggs) mostra a animação. O código dos efeitos só é baixado na
 * primeira vez que algum deles roda.
 */
import { useSyncExternalStore } from 'react';
import { unlockAchievement, type SecretId } from './achievements';

export type EffectName =
  | 'konami'
  | 'party'
  | 'snow'
  | 'matrix'
  | 'wink'
  | 'balloons'
  | 'graduation'
  | 'screensaver'
  | 'palestra'
  | 'obr'
  | 'aquanauta';

export interface ActiveEffect {
  readonly id: number;
  readonly name: EffectName;
  /** Ponto da tela de onde o efeito parte (ex.: o chapéu de formatura). */
  readonly origin?: { readonly x: number; readonly y: number };
}

/** Conquista de cada efeito. */
const ACHIEVEMENT: Record<EffectName, SecretId> = {
  konami: 'konami',
  party: 'party',
  snow: 'guarapuava',
  matrix: 'matrix',
  wink: 'wink',
  balloons: 'birthday',
  graduation: 'graduation',
  screensaver: 'screensaver',
  palestra: 'rival',
  obr: 'obr',
  aquanauta: 'aquanauta',
};

/** Efeitos que são só movimento: com "reduzir movimento" só dão a conquista. */
const PURE_MOTION: ReadonlySet<EffectName> = new Set([
  'konami',
  'party',
  'snow',
  'matrix',
  'wink',
  'balloons',
  'palestra',
  'obr',
]);

let active: readonly ActiveEffect[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function playEffect(name: EffectName, origin?: { x: number; y: number }): void {
  unlockAchievement(ACHIEVEMENT[name]);
  if (PURE_MOTION.has(name) && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // O mesmo efeito não empilha: um de cada tipo por vez.
  if (active.some((effect) => effect.name === name)) return;
  active = [...active, { id: nextId++, name, ...(origin ? { origin } : {}) }];
  emit();
}

export function endEffect(id: number): void {
  active = active.filter((effect) => effect.id !== id);
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useEffects = () =>
  useSyncExternalStore(
    subscribe,
    () => active,
    () => active,
  );

/**
 * Papel de parede "A Noite Estrelada" (digitar "van gogh" na busca): liga e desliga.
 * Ao ligar, a janela do portfólio fica quase transparente por uns segundos, para o
 * papel de parede aparecer inteiro (ela cobre quase tudo em telas pequenas).
 */
export function toggleStarryWallpaper(): void {
  const root = document.documentElement;
  const on = root.classList.toggle('wallpaper-vangogh');
  if (!on) return;
  unlockAchievement('vangogh');
  const frame = document.querySelector('.aero-window');
  frame?.classList.add('egg-peek');
  window.setTimeout(() => frame?.classList.remove('egg-peek'), 3400);
}
