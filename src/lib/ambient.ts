/**
 * Som de fundo em loop contínuo (Web Audio API: sem a pausa que <audio loop>
 * deixa entre repetições). Volume e "mudo" ficam salvos no navegador.
 *
 * Autoplay: navegadores só liberam áudio após a primeira interação do visitante
 * (clique, toque ou tecla). Tentamos tocar ao entrar; se bloqueado, o som
 * começa na primeira interação — nenhuma página consegue contornar essa regra.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SoundConfig } from '../types/portfolio';

const VOLUME_KEY = 'portfolio-aero:volume';
const MUTED_KEY = 'portfolio-aero:muted';
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchend'] as const;

export type AmbientStatus = 'idle' | 'loading' | 'waiting-interaction' | 'playing' | 'muted' | 'error';

function readNumber(key: string, fallback: number): number {
  try {
    const value = Number(localStorage.getItem(key));
    return localStorage.getItem(key) !== null && Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function readBool(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sem armazenamento: vale só na sessão */
  }
}

/** 0–100 → ganho com curva perceptual (o ouvido percebe volume de forma não linear). */
const toGain = (volume: number) => Math.pow(Math.min(100, Math.max(0, volume)) / 100, 2);

class AmbientPlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private loading: Promise<void> | null = null;
  private pendingGain: number | null = null;
  private disposed = false;

  constructor(
    private readonly config: SoundConfig,
    private readonly report: (status: AmbientStatus) => void,
  ) {}

  /** Um player descartado (ex.: remontagem do React) não altera mais o estado. */
  private onStatus(status: AmbientStatus) {
    if (!this.disposed) this.report(status);
  }

  /** Carrega e tenta tocar. Se o navegador bloquear, aguarda a primeira interação. */
  start(gain: number): Promise<void> {
    if (this.loading) return this.loading;
    this.onStatus('loading');
    this.loading = (async () => {
      const ctx = new AudioContext();
      const node = ctx.createGain();
      node.gain.value = 0;
      node.connect(ctx.destination);
      this.ctx = ctx;
      this.gain = node;

      const response = await fetch(this.config.src);
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const [loopStart, loopEnd] = this.config.loop ?? [0, buffer.duration];
      source.loopStart = loopStart;
      source.loopEnd = Math.min(loopEnd, buffer.duration);
      source.connect(node);
      source.start(0, loopStart);
      this.source = source;

      await ctx.resume().catch(() => undefined);
      if (ctx.state === 'running') {
        this.fadeTo(gain, 2);
        this.onStatus('playing');
      } else {
        this.onStatus('waiting-interaction');
        this.unlockOnInteraction(gain);
      }
    })().catch((error: unknown) => {
      console.warn('[som de fundo]', error);
      this.onStatus('error');
    });
    return this.loading;
  }

  private unlockOnInteraction(gain: number) {
    const unlock = () => {
      UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, unlock, true));
      this.ctx
        ?.resume()
        .then(() => {
          this.fadeTo(this.pendingGain ?? gain, 2);
          this.onStatus(this.pendingGain === 0 ? 'muted' : 'playing');
        })
        .catch(() => this.onStatus('error'));
    };
    UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, unlock, { capture: true }));
  }

  /** Transição suave de volume (evita estalos). */
  fadeTo(gain: number, seconds = 0.08) {
    this.pendingGain = gain;
    if (!this.ctx || !this.gain || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(gain, now + seconds);
  }

  get started(): boolean {
    return this.loading !== null;
  }

  dispose() {
    this.disposed = true;
    try {
      this.source?.stop();
    } catch {
      /* ainda não iniciado */
    }
    void this.ctx?.close().catch(() => undefined);
  }
}

export interface AmbientSound {
  readonly status: AmbientStatus;
  readonly volume: number;
  readonly muted: boolean;
  readonly setVolume: (volume: number) => void;
  readonly toggleMute: () => void;
}

export function useAmbientSound(config: SoundConfig): AmbientSound {
  const [volume, setVolumeState] = useState(() => readNumber(VOLUME_KEY, config.defaultVolume));
  const [muted, setMuted] = useState(() => readBool(MUTED_KEY));
  const [status, setStatus] = useState<AmbientStatus>(() => (readBool(MUTED_KEY) ? 'muted' : 'idle'));
  const player = useRef<AmbientPlayer | null>(null);
  const lastGain = useRef<number | null>(null);

  const effectiveGain = muted ? 0 : toGain(volume);

  // Ao entrar: tenta tocar (exceto se o visitante deixou mudo da última vez).
  useEffect(() => {
    const instance = new AmbientPlayer(config, setStatus);
    player.current = instance;
    if (!readBool(MUTED_KEY)) {
      // Depois do primeiro paint: o áudio não disputa banda com o conteúdo.
      const timer = window.setTimeout(
        () => void instance.start(toGain(readNumber(VOLUME_KEY, config.defaultVolume))),
        300,
      );
      return () => {
        window.clearTimeout(timer);
        instance.dispose();
      };
    }
    return () => instance.dispose();
  }, [config]);

  // Mudanças de volume/mudo feitas pelo visitante (não roda na montagem).
  useEffect(() => {
    const instance = player.current;
    const previous = lastGain.current;
    lastGain.current = effectiveGain;
    if (!instance || previous === null || previous === effectiveGain) return;
    if (!instance.started && effectiveGain > 0) {
      void instance.start(effectiveGain); // reativou o som: carrega agora
      return;
    }
    instance.fadeTo(effectiveGain);
    setStatus((current) =>
      current === 'playing' || current === 'muted' ? (effectiveGain === 0 ? 'muted' : 'playing') : current,
    );
  }, [effectiveGain]);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.round(Math.min(100, Math.max(0, next)));
    setVolumeState(clamped);
    write(VOLUME_KEY, String(clamped));
    if (clamped > 0) {
      setMuted(false);
      write(MUTED_KEY, 'false');
    }
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    write(MUTED_KEY, String(next));
    // Reativar com o controle em 0 não teria efeito audível: volta ao volume padrão.
    if (!next && volume === 0) {
      setVolumeState(config.defaultVolume);
      write(VOLUME_KEY, String(config.defaultVolume));
    }
  }, [muted, volume, config.defaultVolume]);

  return { status, volume, muted, setVolume, toggleMute };
}
