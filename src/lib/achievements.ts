/**
 * Conquistas (easter eggs): cada segredo achado vira uma notificação no estilo do
 * Xbox 360 e entra na contagem "X de 30 segredos" do menu Iniciar. O progresso fica
 * salvo no navegador do visitante (nada vai para servidor).
 *
 * Para um easter egg avisar que foi achado: `unlockAchievement('konami')`.
 * Textos (título e dica de cada um) ficam em src/i18n/ui.ts → `achievements`.
 * A 30ª conquista ("collector") vem sozinha quando as outras 29 foram achadas.
 */
import { useSyncExternalStore } from 'react';
import { soundPrefs } from './ambient';

export const SECRET_IDS = [
  'konami',
  'bsod',
  'flip3d',
  'aeroshake',
  'solitaire',
  'minesweeper',
  'screensaver',
  'nudge',
  'clippyAngry',
  'clippyBonzi',
  'msnStatus',
  'wink',
  'party',
  'visualizer',
  'scratch',
  'headphones',
  'penguin',
  'rival',
  'obr',
  'guarapuava',
  'graduation',
  'aquanauta',
  'console',
  'vangogh',
  'matrix',
  'leet',
  'birthday',
  'maximize',
] as const;

export type SecretId = (typeof SECRET_IDS)[number];
export type AchievementId = SecretId | 'collector';

export const ACHIEVEMENT_TOTAL = SECRET_IDS.length + 1;

const STORAGE_KEY = 'portfolio-aero:achievements';

function load(): ReadonlySet<AchievementId> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const valid = new Set<string>([...SECRET_IDS, 'collector']);
    return new Set((Array.isArray(raw) ? raw : []).filter((id): id is AchievementId => valid.has(String(id))));
  } catch {
    return new Set();
  }
}

let unlocked: ReadonlySet<AchievementId> = load();
let queue: readonly AchievementId[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
}

/** Marca um segredo como achado (só na primeira vez): mostra a notificação e toca o som. */
export function unlockAchievement(id: AchievementId): void {
  if (unlocked.has(id)) return;
  unlocked = new Set([...unlocked, id]);
  queue = [...queue, id];
  save();
  emit();
  playUnlockSound();
  // Todos os 29 segredos achados: a conquista final aparece logo depois.
  if (id !== 'collector' && SECRET_IDS.every((secret) => unlocked.has(secret))) {
    window.setTimeout(() => unlockAchievement('collector'), 1500);
  }
}

/** A notificação mostrada saiu da tela: passa para a próxima da fila. */
export function dismissAchievement(): void {
  queue = queue.slice(1);
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useUnlockedAchievements = () =>
  useSyncExternalStore(
    subscribe,
    () => unlocked,
    () => unlocked,
  );
export const useAchievementQueue = () =>
  useSyncExternalStore(
    subscribe,
    () => queue,
    () => queue,
  );

/* ------------------------------ som ------------------------------------- */

let audio: AudioContext | null = null;

/**
 * Som de conquista, gerado na hora (sem arquivo): um arpejo ascendente de sinos
 * (dó–mi–sol–dó) com um brilho agudo no fim, no espírito do "ding" do Xbox 360.
 * Respeita o "mudo" e o volume escolhidos pelo visitante.
 */
function playUnlockSound(): void {
  const { muted, volume } = soundPrefs();
  if (muted || volume <= 0) return;
  try {
    audio ??= new AudioContext();
    const ctx = audio;
    if (ctx.state === 'suspended') void ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.28 * Math.pow(volume / 100, 2) + 0.04;
    master.connect(ctx.destination);
    const start = ctx.currentTime + 0.02;
    // [frequência (Hz), atraso (s), duração (s)]
    const notes: readonly (readonly [number, number, number])[] = [
      [1046.5, 0, 0.9],
      [1318.5, 0.11, 0.9],
      [1568, 0.22, 0.9],
      [2093, 0.33, 1.4],
      [3136, 0.33, 0.8],
    ];
    for (const [freq, delay, length] of notes) {
      for (const [mult, level] of [
        [1, 1],
        [2.01, 0.28],
        [3.99, 0.1],
      ] as const) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * mult;
        const t0 = start + delay;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(level * 0.5, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
        osc.connect(gain).connect(master);
        osc.start(t0);
        osc.stop(t0 + length + 0.05);
      }
    }
  } catch {
    /* sem Web Audio: a notificação aparece em silêncio */
  }
}
