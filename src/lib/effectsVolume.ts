/**
 * Volume dos efeitos sonoros (sons do Windows 7, conquistas, easter eggs),
 * separado do volume da música de fundo (lib/ambient.ts). Fica salvo no
 * navegador e é lido na hora de cada som; o mixer da bandeja assina as mudanças.
 */
import { useSyncExternalStore } from 'react';

const VOLUME_KEY = 'portfolio-aero:fx-volume';
const MUTED_KEY = 'portfolio-aero:fx-muted';
const DEFAULT_VOLUME = 60;

export interface EffectsPrefs {
  readonly muted: boolean;
  readonly volume: number;
}

function read(): EffectsPrefs {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const volume = raw !== null && Number.isFinite(Number(raw)) ? Number(raw) : DEFAULT_VOLUME;
    return { muted: localStorage.getItem(MUTED_KEY) === 'true', volume };
  } catch {
    return { muted: false, volume: DEFAULT_VOLUME };
  }
}

let current: EffectsPrefs = read();
const listeners = new Set<() => void>();

function save(next: EffectsPrefs): void {
  current = next;
  try {
    localStorage.setItem(VOLUME_KEY, String(next.volume));
    localStorage.setItem(MUTED_KEY, String(next.muted));
  } catch {
    /* sem armazenamento: vale só na sessão */
  }
  listeners.forEach((listener) => listener());
}

/** Preferências atuais dos efeitos (lidas a cada som). */
export function effectsPrefs(): EffectsPrefs {
  return current;
}

/** Ganho 0–1 dos efeitos, ou 0 no mudo (curva parecida com a da música). */
export function effectsGain(): number {
  return current.muted ? 0 : Math.pow(Math.min(100, Math.max(0, current.volume)) / 100, 1.6);
}

export function setEffectsVolume(volume: number): void {
  const clamped = Math.round(Math.min(100, Math.max(0, volume)));
  // Subir o controle tira do mudo, como no mixer do Windows.
  save({ volume: clamped, muted: clamped > 0 ? false : current.muted });
}

export function toggleEffectsMute(): void {
  const muted = !current.muted;
  save({ muted, volume: !muted && current.volume === 0 ? DEFAULT_VOLUME : current.volume });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useEffectsPrefs(): EffectsPrefs {
  return useSyncExternalStore(subscribe, effectsPrefs, effectsPrefs);
}
