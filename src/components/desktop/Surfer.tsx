import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { duckAmbient } from '../../lib/ambient';
import { effectsGain } from '../../lib/effectsVolume';
import { playLaughSynth } from '../../lib/eggs';
import './surfer.css';

interface SurferProps {
  /** Imagem do surfista (fundo transparente, virado para a direita). */
  readonly image: string;
  readonly alt: string;
  /** Ícone de onde ele sai (a área de trabalho). */
  readonly from: DOMRect | null;
  /** Já saiu de cena (depois da animação de sumir). */
  readonly onGone: () => void;
  /** Minimizado pela barra de tarefas: some e para; ao restaurar, volta do ícone. */
  readonly minimized?: boolean;
}

/** Destinos do passeio, recalculados a cada trecho (a tela pode mudar de tamanho). */
type Spot = 'rideRight' | 'rideLeft' | 'rideMiddle' | 'topRight' | 'topLeft' | 'random';
const ROUTE: readonly Spot[] = [
  'rideRight',
  'topRight',
  'topLeft',
  'rideLeft',
  'random',
  'rideMiddle',
  'rideRight',
  'random',
  'topLeft',
  'rideLeft',
  'topRight',
  'random',
];

const LEAVE_MS = 520;
/** Pausa entre uma gargalhada e outra. */
const GAP_MS = 2000;
/** Duração da risada sintetizada (sem voz no navegador). */
const SYNTH_LAUGH_MS = 1100;
/** Uma fala de risada nunca passa disso (se o navegador não avisar o fim). */
const MAX_LAUGH_MS = 4000;
const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/**
 * O Bonzi surfando pela tela: desce na barra de tarefas como se fosse uma onda,
 * sobe pelos cantos, cruza a área de trabalho e volta, até alguém clicar nele
 * (ou apertar Esc); aí ele some com um "puf". Fica acima da janela e da barra.
 * Enquanto surfa, um balão em cima dele solta frases de "vírus" e ele dá
 * gargalhadas irritantes sem parar (voz do navegador, no volume dos Efeitos),
 * com a música do portfólio calada enquanto ele estiver na tela.
 * Com "reduzir movimento", não passeia: fica parado sobre a barra de tarefas.
 */
export function Surfer({ image, alt, from, onGone, minimized = false }: SurferProps) {
  const { t } = useI18n();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [line, setLine] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  }, [onGone]);

  // Passeio: posição, balanço na onda, inclinação e para que lado está virado.
  useEffect(() => {
    const button = buttonRef.current;
    const body = bodyRef.current;
    if (!button || !body || leaving || minimized) return;

    const size = () => Math.round(Math.min(140, Math.max(84, window.innerWidth * 0.2)));
    const taskbar = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height')) || 40;
    // Na onda: a prancha (a ~85% da altura da imagem) corre por cima da barra de
    // tarefas, um pouco para dentro dela, e a quilha mergulha na barra.
    const rideY = () => window.innerHeight - taskbar() - size() * 0.85 + 8;
    const maxX = () => Math.max(0, window.innerWidth - size());

    // O balão vai para baixo dele perto do topo e encosta na borda perto dos lados.
    let bubbleSpot = '';
    const place = (x: number, y: number, tilt: number, facing: number) => {
      button.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      body.style.transform = `rotate(${tilt.toFixed(2)}deg) scaleX(${facing})`;
      const bubble = bubbleRef.current;
      if (!bubble) return;
      const s = size();
      const vertical = y < Math.min(150, bubble.offsetHeight + 24) ? 'below' : 'above';
      const horizontal = x + s / 2 < 130 ? 'start' : x + s / 2 > window.innerWidth - 130 ? 'end' : 'center';
      const spot = `${vertical} ${horizontal}`;
      if (spot !== bubbleSpot) {
        bubbleSpot = spot;
        bubble.dataset.v = vertical;
        bubble.dataset.h = horizontal;
      }
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      place(maxX() - 24, rideY(), 0, -1);
      return;
    }

    const spot = (name: Spot): [number, number] => {
      const s = size();
      switch (name) {
        case 'rideRight':
          return [maxX(), rideY()];
        case 'rideLeft':
          return [0, rideY()];
        case 'rideMiddle':
          return [maxX() / 2, rideY()];
        case 'topRight':
          return [maxX(), 0];
        case 'topLeft':
          return [0, 0];
        case 'random':
          return [Math.random() * maxX(), Math.random() * Math.max(0, rideY() - s * 0.6)];
      }
    };

    // Começa no ícone (centralizado nele) ou no canto de baixo à esquerda.
    const s0 = size();
    let x = from ? from.left + from.width / 2 - s0 / 2 : 0;
    let y = from ? from.top + from.height / 2 - s0 / 2 : rideY();
    let facing = 1;
    let step = 0;
    let leg = { x0: x, y0: y, x1: x, y1: y, start: 0, duration: 1, arc: 0 };

    const nextLeg = (now: number) => {
      const [x1, y1] = spot(ROUTE[step % ROUTE.length]!);
      step++;
      const distance = Math.hypot(x1 - x, y1 - y);
      const speed = Math.max(240, window.innerWidth * 0.32); // px/s
      const onWave = Math.abs(y1 - rideY()) < 2 && Math.abs(y - rideY()) < 2;
      leg = {
        x0: x,
        y0: y,
        x1,
        y1,
        start: now,
        duration: Math.max(700, (distance / speed) * 1000),
        // No ar (fora da barra), o trecho faz um arco, como um salto na onda.
        // Perto do topo, o arco vira um mergulho (para baixo), para não sair da tela.
        arc: onWave ? 0 : Math.min(120, distance * 0.25) * (Math.min(y, y1) < 120 ? -1 : 1),
      };
      if (Math.abs(x1 - x) > 4) facing = x1 > x ? 1 : -1;
    };

    let frame = 0;
    const tick = (now: number) => {
      if (leg.start === 0) nextLeg(now);
      let p = (now - leg.start) / leg.duration;
      if (p >= 1) {
        x = leg.x1;
        y = leg.y1;
        nextLeg(now);
        p = 0;
      }
      const e = easeInOut(p);
      x = leg.x0 + (leg.x1 - leg.x0) * e;
      y = leg.y0 + (leg.y1 - leg.y0) * e - Math.sin(Math.PI * p) * leg.arc;
      // Balanço da onda e inclinação na direção do movimento.
      const seconds = now / 1000;
      const bob = Math.sin(seconds * 5.2) * 4;
      const speedX = ((leg.x1 - leg.x0) / leg.duration) * 1000 * Math.sin(Math.PI * p);
      const tilt = Math.max(-14, Math.min(14, speedX * 0.025)) + Math.sin(seconds * 3.1) * 4;
      place(Math.min(Math.max(x, 0), maxX()), Math.min(Math.max(y + bob, 0), rideY() + 4), tilt, facing);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, leaving, minimized]);

  // Frases de vírus no balão, trocando a cada poucos segundos (ordem embaralhada).
  const lines = t.bonzi.lines;
  const order = useRef<number[]>([]);
  useEffect(() => {
    if (leaving || minimized) return;
    const timer = window.setInterval(() => {
      if (order.current.length === 0) {
        order.current = lines.map((_, i) => i).sort(() => Math.random() - 0.5);
      }
      setLine(order.current.pop() ?? 0);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [leaving, minimized, lines]);

  // Gargalhadas sem parar: uma termina, 2 segundos de pausa, vem a próxima.
  // Enquanto ele surfa, a música do portfólio se cala (e volta quando ele sai).
  const laughs = t.bonzi.laughs;
  const lang = t.bonzi.lang;
  useEffect(() => {
    if (leaving || minimized) return;
    duckAmbient('bonzi', true);
    const speech =
      'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined' ? window.speechSynthesis : null;
    let timer = 0;
    let alive = true;
    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      if (alive) timer = window.setTimeout(laugh, ms);
    };
    function laugh() {
      const gain = effectsGain();
      // No mudo dos Efeitos, fica quieto, mas continua conferindo (pode ser religado).
      if (gain <= 0) return schedule(GAP_MS);
      if (!speech) {
        playLaughSynth();
        return schedule(SYNTH_LAUGH_MS + GAP_MS);
      }
      const utterance = new SpeechSynthesisUtterance(laughs[Math.floor(Math.random() * laughs.length)]);
      utterance.lang = lang;
      // Bem agudo e acelerado: a voz robótica e esganiçada do Bonzi.
      utterance.pitch = 1.7 + Math.random() * 0.3;
      utterance.rate = 1.15 + Math.random() * 0.25;
      utterance.volume = Math.min(1, 0.35 + gain);
      const voice = speech.getVoices().find((v) => v.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
      if (voice) utterance.voice = voice;
      utterance.onend = () => schedule(GAP_MS);
      utterance.onerror = () => schedule(GAP_MS);
      speech.cancel();
      speech.speak(utterance);
      // Garantia: alguns navegadores não avisam o fim da fala.
      schedule(MAX_LAUGH_MS + GAP_MS);
    }
    schedule(500);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      speech?.cancel();
      duckAmbient('bonzi', false);
    };
  }, [leaving, minimized, laughs, lang]);

  // Clique (ou Esc): para o passeio e some.
  const leave = () => setLeaving(true);
  useEffect(() => {
    if (leaving) {
      const timer = window.setTimeout(() => gone.current(), LEAVE_MS);
      return () => window.clearTimeout(timer);
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLeaving(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leaving]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`surfer${leaving ? ' surfer--leaving' : ''}${minimized ? ' surfer--minimized' : ''}`}
      inert={minimized}
      aria-label={t.surferStop(alt)}
      title={t.surferStop(alt)}
      onClick={leave}
      disabled={leaving}
    >
      <span ref={bubbleRef} className="surfer__bubble" data-v="above" data-h="center" aria-hidden="true">
        <span key={line} className="surfer__bubble-text">
          {lines[line]}
        </span>
      </span>
      <span ref={bodyRef} className="surfer__body">
        <img className="surfer__image" src={image} alt="" draggable={false} />
      </span>
      <span className="surfer__poof" aria-hidden="true" />
    </button>
  );
}
