/**
 * Utilitários compartilhados pelos easter eggs: tremor e pulo de janelas e efeitos
 * sonoros gerados na hora (sem arquivos), que respeitam o mudo e o volume do visitante.
 */

import { effectsPrefs } from './effectsVolume';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SHAKE: Keyframe[] = [
  { translate: '0 0' },
  { translate: '-9px 3px' },
  { translate: '8px -4px' },
  { translate: '-7px -3px' },
  { translate: '9px 4px' },
  { translate: '-6px 5px' },
  { translate: '6px -5px' },
  { translate: '-4px 2px' },
  { translate: '3px -2px' },
  { translate: '0 0' },
];

/** Sacode um elemento (como o "chamar a atenção" do MSN). Sem efeito com "reduzir movimento". */
export function shakeElement(element: Element | null | undefined): void {
  if (!element || reducedMotion()) return;
  element.animate(SHAKE, { duration: 620, easing: 'linear' });
}

/** Pulinho de uma janela (o botão Maximizar "tentando" crescer). */
export function hopElement(element: Element | null | undefined): void {
  if (!element || reducedMotion()) return;
  element.animate(
    [
      { translate: '0 0', scale: '1' },
      { translate: '0 -26px', scale: '1.015', offset: 0.35 },
      { translate: '0 0', scale: '1', offset: 0.7 },
      { translate: '0 -8px', scale: '1.004', offset: 0.85 },
      { translate: '0 0', scale: '1' },
    ],
    { duration: 520, easing: 'ease-out' },
  );
}

/* ------------------------------ sons ------------------------------------ */

let audio: AudioContext | null = null;

/** Contexto de áudio dos efeitos curtos, ou null se o visitante deixou o som mudo. */
function context(): AudioContext | null {
  const { muted, volume } = effectsPrefs();
  if (muted || volume <= 0) return null;
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

const level = () => 0.25 + 0.75 * Math.pow(effectsPrefs().volume / 100, 2);

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** "Wicky-wicky" de disco arranhado: ruído filtrado que sobe e desce de tom duas vezes. */
export function playScratch(): void {
  const ctx = context();
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.01;
  const out = ctx.createGain();
  out.gain.value = 0.55 * level();
  out.connect(ctx.destination);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 0.6);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 3.5;
  band.frequency.setValueAtTime(500, t0);
  band.frequency.exponentialRampToValueAtTime(3400, t0 + 0.14);
  band.frequency.exponentialRampToValueAtTime(380, t0 + 0.3);
  band.frequency.exponentialRampToValueAtTime(2800, t0 + 0.42);
  band.frequency.exponentialRampToValueAtTime(420, t0 + 0.56);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(1, t0 + 0.03);
  env.gain.setValueAtTime(0.2, t0 + 0.15);
  env.gain.exponentialRampToValueAtTime(1, t0 + 0.2);
  env.gain.setValueAtTime(0.2, t0 + 0.43);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.58);
  src.connect(band).connect(env).connect(out);
  src.start(t0);
  src.stop(t0 + 0.6);
  // Um "grave" de vinil por baixo.
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = 'sawtooth';
  thump.frequency.setValueAtTime(110, t0);
  thump.frequency.exponentialRampToValueAtTime(55, t0 + 0.5);
  thumpGain.gain.setValueAtTime(0.18, t0);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
  thump.connect(thumpGain).connect(out);
  thump.start(t0);
  thump.stop(t0 + 0.55);
}

/** "Mééé-méé-mée-méeeee": o trombone triste de quando algo dá errado (a zoação dos Nanicos). */
export function playSadTrombone(): void {
  const ctx = context();
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.02;
  const out = ctx.createGain();
  out.gain.value = 0.32 * level();
  out.connect(ctx.destination);
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1400;
  lowpass.connect(out);
  // [frequência, início, duração]
  const notes: readonly (readonly [number, number, number])[] = [
    [311, 0, 0.42],
    [294, 0.45, 0.42],
    [277, 0.9, 0.42],
    [262, 1.35, 1.1],
  ];
  notes.forEach(([freq, at, length], index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const last = index === notes.length - 1;
    osc.frequency.setValueAtTime(freq, t0 + at);
    if (last) {
      // A última nota "murcha": cai de tom com vibrato.
      osc.frequency.linearRampToValueAtTime(freq * 0.9, t0 + at + length);
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 6;
      vibratoGain.gain.value = 5;
      vibrato.connect(vibratoGain).connect(osc.frequency);
      vibrato.start(t0 + at + 0.35);
      vibrato.stop(t0 + at + length);
    }
    gain.gain.setValueAtTime(0.0001, t0 + at);
    gain.gain.linearRampToValueAtTime(0.9, t0 + at + 0.04);
    gain.gain.setValueAtTime(0.9, t0 + at + length - 0.08);
    gain.gain.linearRampToValueAtTime(0.0001, t0 + at + length);
    osc.connect(gain).connect(lowpass);
    osc.start(t0 + at);
    osc.stop(t0 + at + length + 0.05);
  });
}

/** Gotinha d'água ("blop") do lembrete de hidratação do Aquanauta. */
export function playDrop(): void {
  const ctx = context();
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.02;
  const out = ctx.createGain();
  out.gain.value = 0.5 * level();
  out.connect(ctx.destination);
  for (const [start, from, to] of [
    [0, 500, 1400],
    [0.2, 700, 1800],
  ] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, t0 + start);
    osc.frequency.exponentialRampToValueAtTime(to, t0 + start + 0.09);
    gain.gain.setValueAtTime(0.0001, t0 + start);
    gain.gain.exponentialRampToValueAtTime(0.9, t0 + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + 0.16);
    osc.connect(gain).connect(out);
    osc.start(t0 + start);
    osc.stop(t0 + start + 0.18);
  }
}

/**
 * Gargalhada irritante (para quando o navegador não tem voz sintetizada):
 * sílabas "rá" de serra com formante, cada uma um pouco mais aguda e esganiçada.
 */
export function playLaughSynth(): void {
  const ctx = context();
  if (!ctx) return;
  const out = ctx.createGain();
  out.gain.value = 0.22 * level();
  out.connect(ctx.destination);
  const formant = ctx.createBiquadFilter();
  formant.type = 'bandpass';
  formant.frequency.value = 1100;
  formant.Q.value = 2.2;
  formant.connect(out);
  const start = ctx.currentTime + 0.02;
  const syllables = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < syllables; i++) {
    const at = start + i * 0.145;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const pitch = 330 + i * 18 + Math.random() * 30;
    osc.frequency.setValueAtTime(pitch * 1.25, at);
    osc.frequency.exponentialRampToValueAtTime(pitch, at + 0.11);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(1, at + 0.015);
    env.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
    osc.connect(env).connect(formant);
    osc.start(at);
    osc.stop(at + 0.13);
  }
}
