import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import './surfer.css';

interface SurferProps {
  /** Imagem do surfista (fundo transparente, virado para a direita). */
  readonly image: string;
  readonly alt: string;
  /** Ícone de onde ele sai (a área de trabalho). */
  readonly from: DOMRect | null;
  /** Já saiu de cena (depois da animação de sumir). */
  readonly onGone: () => void;
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
const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/**
 * O Bonzi surfando pela tela: desce na barra de tarefas como se fosse uma onda,
 * sobe pelos cantos, cruza a área de trabalho e volta, até alguém clicar nele
 * (ou apertar Esc); aí ele some com um "puf". Fica acima da janela e da barra.
 * Com "reduzir movimento", não passeia: fica parado sobre a barra de tarefas.
 */
export function Surfer({ image, alt, from, onGone }: SurferProps) {
  const { t } = useI18n();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const [leaving, setLeaving] = useState(false);
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  }, [onGone]);

  // Passeio: posição, balanço na onda, inclinação e para que lado está virado.
  useEffect(() => {
    const button = buttonRef.current;
    const body = bodyRef.current;
    if (!button || !body || leaving) return;

    const size = () => Math.round(Math.min(140, Math.max(84, window.innerWidth * 0.2)));
    const taskbar = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height')) || 40;
    // Na onda: a prancha (a ~85% da altura da imagem) corre por cima da barra de
    // tarefas, um pouco para dentro dela, e a quilha mergulha na barra.
    const rideY = () => window.innerHeight - taskbar() - size() * 0.85 + 8;
    const maxX = () => Math.max(0, window.innerWidth - size());

    const place = (x: number, y: number, tilt: number, facing: number) => {
      button.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      body.style.transform = `rotate(${tilt.toFixed(2)}deg) scaleX(${facing})`;
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
  }, [from, leaving]);

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
      className={`surfer${leaving ? ' surfer--leaving' : ''}`}
      aria-label={t.surferStop(alt)}
      title={t.surferStop(alt)}
      onClick={leave}
      disabled={leaving}
    >
      <span ref={bodyRef} className="surfer__body">
        <img className="surfer__image" src={image} alt="" draggable={false} />
      </span>
      <span className="surfer__poof" aria-hidden="true" />
    </button>
  );
}
