/**
 * Som de fundo em loop contínuo (Web Audio API: sem a pausa que <audio loop>
 * deixa entre repetições). Volume e "mudo" ficam salvos no navegador.
 *
 * A música acompanha a janela do portfólio: começa quando ela é aberta
 * (`play()`), continua com ela minimizada e para quando é fechada (`stop()`).
 * Reabrir toca de novo, do início do trecho. Como abrir a janela é uma interação
 * do visitante, o navegador libera o áudio na hora; se ainda assim bloquear, o
 * som começa na interação seguinte.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SoundConfig } from '../types/portfolio';

const VOLUME_KEY = 'portfolio-aero:volume';
const MUTED_KEY = 'portfolio-aero:muted';
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchend'] as const;
/** Entrada e saída suaves da música, em segundos. */
const FADE_IN = 2;
const FADE_OUT = 0.4;

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

/** Uma execução da música: a fonte e o ganho próprio dela (entrada/saída suaves). */
interface Voice {
  readonly source: AudioBufferSourceNode;
  readonly gain: GainNode;
  /** Já começou a subir o volume (o áudio estava liberado pelo navegador). */
  audible: boolean;
}

/**
 * Cadeia de áudio: fonte → ganho da execução (fade) → ganho geral (volume) → saída.
 * O arquivo é baixado e decodificado uma vez; cada `play()` cria uma fonte nova.
 */
class AmbientPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private voice: Voice | null = null;
  private loading: Promise<void> | null = null;
  /** A música deveria estar tocando (janela aberta ou minimizada). */
  private wanted = false;
  private level = 0;
  private removeUnlock: (() => void) | null = null;
  private disposed = false;

  constructor(
    private readonly config: SoundConfig,
    private readonly report: (status: AmbientStatus) => void,
  ) {}

  /** Um player descartado (ex.: remontagem do React) não altera mais o estado. */
  private onStatus(status: AmbientStatus) {
    if (!this.disposed) this.report(status);
  }

  /** Tocando, ou prestes a tocar (ainda carregando o arquivo). */
  get active(): boolean {
    return this.voice !== null || (this.wanted && this.loading !== null && this.buffer === null);
  }

  /**
   * Toca do início do trecho. Na primeira vez, baixa e decodifica o arquivo.
   *
   * Importante: não esperar (await) `ctx.resume()` quando o autoplay está
   * bloqueado. No Chrome essa promessa fica pendente até o som ser liberado,
   * e quem espera por ela nunca chega a registrar o "tocar ao clicar".
   */
  play(level: number) {
    this.wanted = true;
    this.level = level;
    if (this.buffer) {
      this.startVoice();
      return;
    }
    if (this.loading) return;
    this.onStatus('loading');
    this.loading = (async () => {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = level;
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      // Liberação do som (agora ou após um clique, mesmo durante o download).
      ctx.addEventListener('statechange', () => this.reveal());
      this.unlockOnInteraction(ctx);

      const response = await fetch(this.config.src);
      if (!response.ok) throw new Error(`HTTP ${response.status} ao carregar ${this.config.src}`);
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      if (this.disposed) return;
      this.buffer = buffer;
      // A janela pode ter sido fechada durante o download.
      if (this.wanted) this.startVoice();
      else this.onStatus('idle');
    })().catch((error: unknown) => {
      console.warn('[som de fundo]', error);
      this.onStatus('error');
    });
  }

  private startVoice() {
    const { ctx, master, buffer } = this;
    if (!ctx || !master || !buffer || this.voice) return;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const [loopStart, loopEnd] = this.config.loop ?? [0, buffer.duration];
    source.loopStart = loopStart;
    source.loopEnd = Math.min(loopEnd, buffer.duration);
    source.connect(gain);
    source.start(0, loopStart);
    this.voice = { source, gain, audible: false };
    master.gain.value = this.level;

    void ctx.resume().catch(() => undefined); // áudio liberado: começa já
    if (ctx.state === 'running') this.reveal();
    else this.onStatus('waiting-interaction');
  }

  /** Sobe o volume da execução atual quando o navegador liberar o áudio. */
  private reveal() {
    const { ctx, voice } = this;
    if (this.disposed || !ctx || !voice || voice.audible || ctx.state !== 'running') return;
    voice.audible = true;
    const now = ctx.currentTime;
    voice.gain.gain.setValueAtTime(0, now);
    voice.gain.gain.linearRampToValueAtTime(1, now + FADE_IN);
    this.onStatus(this.level === 0 ? 'muted' : 'playing');
  }

  /** Para a música com uma saída curta (janela fechada). `play()` toca de novo. */
  stop() {
    this.wanted = false;
    const { ctx, voice } = this;
    if (!ctx || !voice) return;
    this.voice = null;
    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT);
    voice.source.addEventListener('ended', () => voice.gain.disconnect());
    try {
      voice.source.stop(now + FADE_OUT + 0.05);
    } catch {
      /* já parada */
    }
    this.onStatus('idle');
  }

  /** `resume()` precisa ser chamado dentro do próprio evento do visitante. */
  private unlockOnInteraction(ctx: AudioContext) {
    const unlock = () => {
      if (ctx.state === 'running' || ctx.state === 'closed') {
        UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, unlock, true));
        return;
      }
      void ctx.resume().catch(() => undefined);
    };
    UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, unlock, { capture: true }));
    this.removeUnlock = () => UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, unlock, true));
  }

  /** Volume geral, com transição curta (evita estalos). */
  fadeTo(level: number, seconds = 0.08) {
    this.level = level;
    const { ctx, master } = this;
    if (!ctx || !master) return;
    if (ctx.state !== 'running') {
      master.gain.value = level;
      return;
    }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(level, now + seconds);
  }

  dispose() {
    this.disposed = true;
    this.removeUnlock?.();
    try {
      this.voice?.source.stop();
    } catch {
      /* ainda não iniciada */
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
  /**
   * Janela do portfólio aberta: a música toca (na primeira vez, baixa o arquivo).
   * Chamar com ela já tocando não faz nada.
   */
  readonly play: () => void;
  /** Janela fechada: a música para. */
  readonly stop: () => void;
}

export function useAmbientSound(config: SoundConfig): AmbientSound {
  const [volume, setVolumeState] = useState(() => readNumber(VOLUME_KEY, config.defaultVolume));
  const [muted, setMuted] = useState(() => readBool(MUTED_KEY));
  const [status, setStatus] = useState<AmbientStatus>(() => (readBool(MUTED_KEY) ? 'muted' : 'idle'));
  const player = useRef<AmbientPlayer | null>(null);
  const lastGain = useRef<number | null>(null);
  // A música deveria estar tocando (janela aberta ou minimizada). Fora disso,
  // mexer no volume não a dispara.
  const wanted = useRef(false);

  const effectiveGain = muted ? 0 : toGain(volume);

  // O player nasce parado: só toca depois de play().
  useEffect(() => {
    const instance = new AmbientPlayer(config, setStatus);
    player.current = instance;
    return () => instance.dispose();
  }, [config]);

  // Chamado dentro do clique que abre o portfólio: o navegador aceita o som na
  // hora (é uma interação do visitante). Se ele deixou mudo da última vez, a
  // música só carrega quando o som for reativado.
  const play = useCallback(() => {
    wanted.current = true;
    const instance = player.current;
    if (!instance || instance.active || readBool(MUTED_KEY)) return;
    instance.play(toGain(readNumber(VOLUME_KEY, config.defaultVolume)));
  }, [config.defaultVolume]);

  const stop = useCallback(() => {
    wanted.current = false;
    player.current?.stop();
  }, []);

  // Mudanças de volume/mudo feitas pelo visitante (não roda na montagem).
  useEffect(() => {
    const instance = player.current;
    const previous = lastGain.current;
    lastGain.current = effectiveGain;
    if (!instance || previous === null || previous === effectiveGain) return;
    if (!instance.active) {
      // Reativou o som com a janela aberta: toca agora.
      if (effectiveGain > 0 && wanted.current) instance.play(effectiveGain);
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

  return { status, volume, muted, setVolume, toggleMute, play, stop };
}
