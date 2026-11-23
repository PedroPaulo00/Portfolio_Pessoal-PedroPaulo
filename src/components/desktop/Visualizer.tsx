import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../../i18n/I18n';
import { ambientAnalyser, soundPrefs } from '../../lib/ambient';
import { hueOf, shade, useCoverPalette, type Palette, type Rgb } from '../../lib/palette';
import { useSpotify } from '../../lib/spotify';
import { closeVisualizer } from '../../lib/visualizer';
import { AeroDialog } from '../ui/AeroDialog';
import './visualizer.css';

/** Trecho da música de fundo que se repete (1:20 a 3:23), para a barra de progresso. */
const LOOP_SECONDS = 123;

/** Cores das visualizações (vindas da capa da música; sem capa, o azul do WMP). */
interface Colors {
  readonly top: string;
  readonly mid: string;
  readonly base: string;
  readonly glow: string;
  readonly rgbMid: Rgb;
  readonly hues: readonly [number, number, number];
}

const DEFAULT_PALETTE: Palette = { primary: [44, 140, 230], secondary: [76, 199, 255], accent: [120, 90, 240] };

function colorsFrom(palette: Palette): Colors {
  return {
    top: shade(palette.secondary, 0.7),
    mid: shade(palette.primary, 0.15),
    base: shade(palette.primary, -0.55),
    glow: shade(palette.secondary, 0.25),
    rgbMid: palette.primary,
    hues: [hueOf(palette.primary), hueOf(palette.secondary), hueOf(palette.accent)],
  };
}

type Draw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freq: Uint8Array,
  wave: Uint8Array,
  t: number,
  colors: Colors,
) => void;

/** "Barras e ondas: Barras": colunas com picos que caem devagar e reflexo no chão. */
function makeBars(): Draw {
  const peaks = new Float32Array(56);
  return (ctx, w, h, freq, _wave, _t, colors) => {
    ctx.clearRect(0, 0, w, h);
    const n = peaks.length;
    const gap = 3;
    const barW = (w - gap * (n + 1)) / n;
    const floor = h * 0.72;
    const [r, g, b] = colors.rgbMid;
    for (let i = 0; i < n; i++) {
      // Escala logarítmica: mais barras nos graves, como no WMP.
      const index = Math.floor(Math.pow(i / n, 1.7) * 380) + 2;
      const value = (freq[index] ?? 0) / 255;
      const barH = Math.max(2, value * floor * 0.95);
      const x = gap + i * (barW + gap);
      const grad = ctx.createLinearGradient(0, floor - barH, 0, floor);
      grad.addColorStop(0, colors.top);
      grad.addColorStop(0.25, colors.mid);
      grad.addColorStop(1, colors.base);
      ctx.fillStyle = grad;
      ctx.fillRect(x, floor - barH, barW, barH);
      // Reflexo no "chão" de vidro.
      const ref = ctx.createLinearGradient(0, floor, 0, floor + barH * 0.5);
      ref.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
      ref.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = ref;
      ctx.fillRect(x, floor + 2, barW, barH * 0.5);
      // Pico que cai devagar.
      peaks[i] = Math.max(barH, (peaks[i] ?? 0) - 1.6);
      ctx.fillStyle = colors.top;
      ctx.fillRect(x, floor - (peaks[i] ?? 0) - 4, barW, 2);
    }
  };
}

/** "Barras e ondas: Escopo": a forma de onda brilhante, deixando rastro. */
const scope: Draw = (ctx, w, h, _freq, wave, _t, colors) => {
  ctx.fillStyle = 'rgba(2, 8, 20, 0.28)';
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = colors.top;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  const step = w / (wave.length - 1);
  for (let i = 0; i < wave.length; i += 2) {
    const y = h / 2 + (((wave[i] ?? 128) - 128) / 128) * h * 0.38;
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * step, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
};

/** "Alquimia: Aleatória": raios girando a partir do centro, nas cores da capa, no ritmo dos graves. */
const alchemy: Draw = (ctx, w, h, freq, _wave, t, colors) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  let bass = 0;
  for (let i = 2; i < 24; i++) bass += freq[i] ?? 0;
  bass /= 22 * 255;
  ctx.globalCompositeOperation = 'lighter';
  const spokes = 72;
  for (let i = 0; i < spokes; i++) {
    const v = (freq[((i * 5) % 400) + 4] ?? 0) / 255;
    const angle = (i / spokes) * Math.PI * 2 + t * 0.35;
    const inner = 14 + bass * 40;
    const outer = inner + v * Math.min(w, h) * 0.42;
    // Cada raio usa um dos três tons da capa, oscilando um pouco ao redor dele.
    const hue = colors.hues[i % 3]! + Math.sin(t * 0.8 + i * 0.3) * 18;
    ctx.strokeStyle = `hsla(${hue}, 90%, ${52 + v * 25}%, ${0.35 + v * 0.6})`;
    ctx.lineWidth = 1.5 + v * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.quadraticCurveTo(
      cx + Math.cos(angle + 0.4) * (outer * 0.6),
      cy + Math.sin(angle + 0.4) * (outer * 0.6),
      cx + Math.cos(angle + 0.15) * outer,
      cy + Math.sin(angle + 0.15) * outer,
    );
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

const MODES: readonly (() => Draw)[] = [makeBars, () => scope, () => alchemy];

/**
 * Easter egg (clique na capa do "Ouvindo agora"): o Windows Media Player 12 no
 * modo "Em execução", com a capa, o nome da música e do artista no canto e as
 * visualizações clássicas nas cores da capa. Elas reagem à música de fundo do
 * site; sem som (mudo), seguem o ritmo da música do Spotify (ou um padrão).
 */
export default function Visualizer() {
  const { t } = useI18n();
  const v = t.visualizer;
  const m = t.mediaPlayer;
  const spotify = useSpotify();
  const data = spotify.status === 'ready' ? spotify.data : null;
  const track = data?.nowPlaying?.track ?? data?.recent[0]?.track ?? null;
  const bpm = data?.nowPlaying?.bpm ?? 120;
  const palette = useCoverPalette(track?.image) ?? DEFAULT_PALETTE;
  const colors = colorsFrom(palette);
  const colorsRef = useRef(colors);
  useEffect(() => {
    colorsRef.current = colors;
  });
  const [mode, setMode] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [silent, setSilent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !playing) return;
    const draw = MODES[mode]!();
    const freq = new Uint8Array(1024);
    const wave = new Uint8Array(1024);
    let raf = 0;
    let width = 0;
    let height = 0;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    const start = performance.now();
    let lastSilent: boolean | null = null;
    const loop = (now: number) => {
      const time = (now - start) / 1000;
      const analyser = ambientAnalyser();
      let energy = 0;
      if (analyser && !soundPrefs().muted) {
        analyser.getByteFrequencyData(freq);
        analyser.getByteTimeDomainData(wave);
        for (let i = 0; i < 64; i++) energy += freq[i] ?? 0;
      }
      const isSilent = energy < 200;
      if (isSilent) {
        // Sem som: espectro sintético pulsando no ritmo (BPM do Spotify ou 120).
        const beat = 60 / bpm;
        const kick = Math.exp(-((time % beat) / beat) * 5);
        for (let i = 0; i < freq.length; i++) {
          const fall = Math.exp(-i / 140);
          const wobble = 0.5 + 0.5 * Math.sin(time * 3 + i * 0.07) * Math.sin(time * 1.3 + i * 0.013);
          freq[i] = Math.min(255, 255 * fall * (0.35 * wobble + 0.75 * kick));
        }
        for (let i = 0; i < wave.length; i++) {
          wave[i] = 128 + Math.sin(i * 0.05 + time * 6) * 40 * (0.4 + kick) + Math.sin(i * 0.21 + time * 2) * 12;
        }
      }
      if (isSilent !== lastSilent) {
        lastSilent = isSilent;
        setSilent(isSilent);
      }
      draw(ctx, width, height, freq, wave, time, colorsRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [mode, playing, bpm]);

  const position = elapsed % LOOP_SECONDS;
  const clock = `${String(Math.floor(position / 60)).padStart(2, '0')}:${String(position % 60).padStart(2, '0')}`;
  const cycle = (step: number) => {
    setPlaying(true);
    setMode((current) => (current + step + MODES.length) % MODES.length);
  };
  // As cores da capa também tingem o fundo, a barra de progresso e o orbe de tocar.
  const theme = {
    '--viz-a': shade(palette.primary, 0),
    '--viz-light': shade(palette.secondary, 0.55),
    '--viz-glow': shade(palette.primary, 0.1),
    '--viz-deep': shade(palette.primary, -0.62),
    '--viz-deeper': shade(palette.primary, -0.86),
  } as CSSProperties;

  return (
    <AeroDialog open modal={false} wide title={m.title} onClose={closeVisualizer}>
      <div className="wmp-viz" style={theme}>
        <div className="wmp-viz__top">
          <div className="wmp-viz__info">
            {track?.image ? (
              <img className="wmp-viz__cover" src={track.image} alt={t.coverOf(track.album)} width={64} height={64} />
            ) : null}
            <div className="wmp-viz__text">
              <p className="wmp-viz__track">{track?.name ?? v.track}</p>
              {track ? <p className="wmp-viz__artist">{track.artists.map((a) => a.name).join(', ')}</p> : null}
              {playing ? <p className="wmp-viz__mode">{v.modes[mode]}</p> : null}
            </div>
          </div>
          <svg className="wmp-viz__switch" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M1 2h4v4H1zm6 0h4v4H7zM1 8h4v4H1zm9 1 4 3-4 3z" fill="#e6eef8" />
          </svg>
        </div>
        <div className="wmp-viz__stage">
          {playing ? (
            <canvas ref={canvasRef} className="wmp-viz__canvas" aria-hidden="true" />
          ) : (
            <div className="wmp-viz__art" aria-hidden="true">
              {track?.image ? (
                <img src={track.image} alt="" />
              ) : (
                <svg viewBox="0 0 64 64" width="140" height="140">
                  <defs>
                    <linearGradient id="wmp-note" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#9fb7d6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M30 8c0 9 14 12 14 24 0 5-3 8-5 10 4-6 3-12-9-16v22c0 6-6 10-12 10s-9-3-9-7 5-8 11-8c2 0 4 .4 5 1Z"
                    fill="url(#wmp-note)"
                    stroke="#5d7ea8"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </div>
          )}
          {playing && silent ? <p className="wmp-viz__silent">{v.silent}</p> : null}
        </div>
        <div className="wmp-viz__seek" aria-hidden="true">
          <span style={{ width: `${(position / LOOP_SECONDS) * 100}%` }} />
        </div>
        <div className="wmp-viz__bar">
          <span className="wmp-viz__time">{clock}</span>
          <div className="wmp-viz__controls">
            <span className="wmp-viz__btn" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path
                  d="M2 4h3l6 8h3M2 12h3l6-8h3m-2-2 2 2-2 2m0 4 2 2-2 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </span>
            <span className="wmp-viz__btn" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="M13 8a5 5 0 1 1-1.5-3.6M12 1.5v3.2H8.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="wmp-viz__sep" aria-hidden="true" />
            <button
              type="button"
              className="wmp-viz__btn"
              aria-label={m.stop}
              title={m.stop}
              onClick={() => setPlaying(false)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="4" y="4" width="8" height="8" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="wmp-viz__btn wmp-viz__btn--pill"
              aria-label={v.prev}
              title={v.prev}
              onClick={() => cycle(-1)}
            >
              <svg viewBox="0 0 20 16" aria-hidden="true">
                <path
                  d="M3 3v10M17 3 10 8l7 5zM10 3 3 8l7 5z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </button>
            <button
              type="button"
              className="wmp-viz__play"
              aria-label={playing ? m.pause : m.play}
              title={playing ? m.pause : m.play}
              onClick={() => setPlaying((p) => !p)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                {playing ? <path d="M6 4h3v12H6zm5 0h3v12h-3z" fill="#fff" /> : <path d="M7 4v12l10-6z" fill="#fff" />}
              </svg>
            </button>
            <button
              type="button"
              className="wmp-viz__btn wmp-viz__btn--pill"
              aria-label={v.next}
              title={v.next}
              onClick={() => cycle(1)}
            >
              <svg viewBox="0 0 20 16" aria-hidden="true">
                <path
                  d="M17 3v10M3 3l7 5-7 5zM10 3l7 5-7 5z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </button>
            <span className="wmp-viz__sep" aria-hidden="true" />
            <span className="wmp-viz__btn" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
                <path
                  d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </span>
            <span className="wmp-viz__volume" aria-hidden="true">
              <span style={{ width: `${soundPrefs().muted ? 0 : soundPrefs().volume}%` }} />
            </span>
          </div>
          <svg className="wmp-viz__full" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M2 2h12v12H2z" fill="none" stroke="#e6eef8" strokeWidth="1.3" />
            <path d="M6 10l4-4m-3 0h3v3" fill="none" stroke="#e6eef8" strokeWidth="1.3" />
          </svg>
        </div>
      </div>
    </AeroDialog>
  );
}
