import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../../i18n/I18n';
import reminder from '../../assets/projetos/aquanauta-lembrete.webp';
import dvdLogo from '../../assets/desktop/dvd-logo.webp';
import { endEffect, type ActiveEffect } from '../../lib/eggBus';
import { playDrop } from '../../lib/eggs';
import './eggs.css';

/**
 * Os efeitos de tela dos easter eggs (carregados só quando algum roda): bolhas de
 * vidro (Konami), protetor de tela do DVD, neve, chuva "matrix", modo festa, emoticon
 * gigante, balões e o chapéu de formatura. Todos são decorativos (aria-hidden),
 * não bloqueiam cliques e somem sozinhos.
 */
export default function EffectsHost({ effects }: { readonly effects: readonly ActiveEffect[] }) {
  return (
    <div className="egg-host" aria-hidden="true">
      {effects.map((effect) => (
        <Effect key={effect.id} effect={effect} />
      ))}
    </div>
  );
}

function Effect({ effect }: { readonly effect: ActiveEffect }) {
  const done = () => endEffect(effect.id);
  switch (effect.name) {
    case 'konami':
      return <Canvas className="egg-canvas" duration={8} fadeOut={2} factory={bubbles()} onDone={done} />;
    case 'screensaver':
      return <DvdScreensaver onDone={done} />;
    case 'snow':
      return <Canvas className="egg-canvas" duration={15} fadeIn={1.2} fadeOut={3} factory={snow} onDone={done} />;
    case 'matrix':
      return (
        <Canvas
          className="egg-canvas egg-canvas--matrix"
          duration={10}
          fadeIn={0.8}
          fadeOut={1.5}
          factory={matrix}
          onDone={done}
        />
      );
    case 'party':
      return <Party onDone={done} />;
    case 'wink':
      return <Wink onDone={done} />;
    case 'balloons':
      return <Balloons onDone={done} />;
    case 'graduation':
      return <Graduation origin={effect.origin} onDone={done} />;
    case 'palestra':
      return <Palestra onDone={done} />;
    case 'obr':
      return <ObrRobot onDone={done} />;
    case 'aquanauta':
      return <AquanautaReminder onDone={done} />;
  }
}

/* ------------------------------ canvas --------------------------------- */

type Frame = (t: number, dt: number) => void;
type Factory = (ctx: CanvasRenderingContext2D, width: number, height: number) => Frame;

interface CanvasProps {
  readonly className: string;
  readonly duration: number;
  readonly fadeIn?: number;
  readonly fadeOut?: number;
  readonly factory: Factory;
  readonly onDone: () => void;
}

/** Canvas de tela cheia: roda o efeito por `duration` segundos (entra e sai com fade). */
function Canvas({ className, duration, fadeIn = 0.6, fadeOut = 1.2, factory, onDone }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
    const frame = factory(ctx, width, height);
    let raf = 0;
    let last = performance.now();
    const start = last;
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame(t, dt);
      canvas.style.opacity = String(Math.max(0, Math.min(1, t / fadeIn, (duration - t) / fadeOut)));
      if (t >= duration) onDone();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // O efeito é criado uma única vez por montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <canvas ref={ref} className={className} />;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  phase: number;
}

/** Esfera de vidro translúcida: miolo quase transparente, borda colorida e brilho. */
function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble) {
  const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
  g.addColorStop(0, `hsla(${b.hue}, 90%, 85%, 0.12)`);
  g.addColorStop(0.7, `hsla(${b.hue}, 90%, 65%, 0.2)`);
  g.addColorStop(1, `hsla(${b.hue}, 95%, 70%, 0.7)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.22, b.r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

/** Bolhas de vidro subindo (Código Konami). */
function bubbles(): Factory {
  return (ctx, width, height) => {
    const list: Bubble[] = Array.from({ length: 46 }, () => {
      const r = rand(18, 80);
      return {
        x: rand(r, width - r),
        y: rand(height * 0.4, height + 200),
        r,
        vx: 0,
        vy: -rand(60, 170),
        hue: rand(0, 360),
        phase: rand(0, 6.28),
      };
    });
    return (t, dt) => {
      ctx.clearRect(0, 0, width, height);
      for (const b of list) {
        b.y += b.vy * dt;
        b.x += Math.sin(t * 1.4 + b.phase) * 28 * dt;
        if (b.y < -b.r * 2) b.y = height + b.r * 2;
        drawBubble(ctx, b);
      }
    };
  };
}

const snow: Factory = (ctx, width, height) => {
  const flakes = Array.from({ length: Math.round(Math.min(220, width / 6)) }, () => ({
    x: rand(0, width),
    y: rand(-height, height),
    r: rand(1.2, 4.2),
    vy: rand(35, 110),
    sway: rand(10, 40),
    phase: rand(0, 6.28),
  }));
  return (t, dt) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 4;
    for (const f of flakes) {
      f.y += f.vy * dt;
      if (f.y > height + 8) {
        f.y = -8;
        f.x = rand(0, width);
      }
      ctx.beginPath();
      ctx.arc(f.x + Math.sin(t * 0.9 + f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
};

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:.=*+-<>';

const matrix: Factory = (ctx, width, height) => {
  const size = 16;
  const columns = Math.ceil(width / size);
  const drops = Array.from({ length: columns }, () => rand(-40, 0));
  let acc = 0;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${size}px monospace`;
  return (_t, dt) => {
    acc += dt;
    if (acc < 0.05) return;
    acc = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < columns; i++) {
      const y = drops[i]! * size;
      const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
      ctx.fillStyle = '#d6ffd6';
      ctx.fillText(glyph, i * size, y);
      ctx.fillStyle = '#00d63a';
      ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!, i * size, y - size);
      drops[i] = y > height && Math.random() > 0.975 ? 0 : drops[i]! + 1;
    }
  };
};

/* ---------------------------- protetor de tela -------------------------- */

/** Cores do logo, trocadas a cada batida na borda (como nos aparelhos de DVD). */
const DVD_COLORS = ['#ff3131', '#ff8a00', '#ffe500', '#39ff3c', '#00e1ff', '#2f6dff', '#b44dff', '#ff4fd6', '#ffffff'];

/**
 * Protetor de tela do aparelho de DVD: o logo "DVD Video" atravessa a tela preta
 * em diagonal, batendo nas bordas e mudando de cor a cada batida (e brilhando se
 * acertar um canto em cheio). Some ao mexer o mouse, clicar, teclar ou, no
 * celular, com um toque. Com "reduzir movimento", fica parado no meio, só
 * trocando de cor.
 */
function DvdScreensaver({ onDone }: { readonly onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  // Acordar: qualquer gesto. O toque que fecha não "vaza" para o que está embaixo
  // (a camada preta continua por cima durante o sumiço e recebe o clique).
  useEffect(() => {
    if (leaving) {
      const timer = window.setTimeout(onDone, 320);
      return () => window.clearTimeout(timer);
    }
    const armedAt = Date.now() + 600; // ignora o movimento do próprio instante em que ele surge
    let moved = 0;
    const wake = (event: Event) => {
      if (Date.now() < armedAt) return;
      if (event.type === 'pointermove' && (event as PointerEvent).pointerType === 'mouse' && (moved += 1) < 4) return;
      if (event.type === 'pointermove' && (event as PointerEvent).pointerType !== 'mouse') return;
      setLeaving(true);
    };
    const names = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    names.forEach((name) => window.addEventListener(name, wake, { passive: true, capture: true }));
    return () => names.forEach((name) => window.removeEventListener(name, wake, { capture: true }));
  }, [leaving, onDone]);

  useEffect(() => {
    const root = rootRef.current;
    const logo = logoRef.current;
    if (!root || !logo) return;
    let color = Math.floor(Math.random() * DVD_COLORS.length);
    const paint = () => {
      let next = color;
      while (next === color) next = Math.floor(Math.random() * DVD_COLORS.length);
      color = next;
      logo.style.setProperty('--dvd-color', DVD_COLORS[color]!);
    };
    logo.style.setProperty('--dvd-color', DVD_COLORS[color]!);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      logo.classList.add('dvd-saver__logo--still');
      const timer = window.setInterval(paint, 2500);
      return () => window.clearInterval(timer);
    }

    const bounds = () => ({ w: root.clientWidth - logo.offsetWidth, h: root.clientHeight - logo.offsetHeight });
    let { w, h } = bounds();
    let x = Math.random() * Math.max(0, w);
    let y = Math.random() * Math.max(0, h);
    // Velocidade proporcional à tela (devagar no celular, como na TV).
    const speed = Math.min(190, Math.max(80, Math.min(root.clientWidth, root.clientHeight) * 0.2));
    let vx = speed * (Math.random() < 0.5 ? -1 : 1);
    let vy = speed * 0.78 * (Math.random() < 0.5 ? -1 : 1);
    let last = performance.now();
    let corner = 0;
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ({ w, h } = bounds());
      x += vx * dt;
      y += vy * dt;
      let hitX = false;
      let hitY = false;
      if (x <= 0 || x >= w) {
        vx = x <= 0 ? Math.abs(vx) : -Math.abs(vx);
        x = Math.min(Math.max(0, x), Math.max(0, w));
        hitX = true;
      }
      if (y <= 0 || y >= h) {
        vy = y <= 0 ? Math.abs(vy) : -Math.abs(vy);
        y = Math.min(Math.max(0, y), Math.max(0, h));
        hitY = true;
      }
      if (hitX || hitY) paint();
      // O momento mais esperado da história da TV: bater bem no canto.
      if (hitX && hitY) {
        logo.classList.add('is-corner');
        window.clearTimeout(corner);
        corner = window.setTimeout(() => logo.classList.remove('is-corner'), 1400);
      }
      logo.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(corner);
    };
  }, []);

  return (
    <div ref={rootRef} className={`dvd-saver${leaving ? ' is-leaving' : ''}`}>
      <div ref={logoRef} className="dvd-saver__logo" style={{ '--dvd-logo': `url(${dvdLogo})` } as CSSProperties} />
    </div>
  );
}

/* ------------------------------- CSS puro ------------------------------- */

/** Modo festa: luzes de balada pulsando a 128 BPM sobre a área de trabalho. */
function Party({ onDone }: { readonly onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 11000);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return (
    <div className="egg-party">
      <i />
      <i />
      <i />
      <i />
      <b />
    </div>
  );
}

/** Emoticon sorridente gigante (estilo MSN) cruzando a tela. */
function Wink({ onDone }: { readonly onDone: () => void }) {
  return (
    <div className="egg-wink" onAnimationEnd={onDone}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="egg-face" cx="38%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff9b0" />
            <stop offset="0.55" stopColor="#ffd92a" />
            <stop offset="1" stopColor="#e69a0b" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#egg-face)" stroke="#b86e00" strokeWidth="2.5" />
        <ellipse cx="36" cy="42" rx="5.5" ry="8" fill="#4a2a00" />
        <ellipse cx="64" cy="42" rx="5.5" ry="8" fill="#4a2a00" />
        <path d="M27 62c6 14 40 14 46 0" fill="none" stroke="#4a2a00" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="33" cy="22" rx="14" ry="7" fill="#fff" opacity="0.5" transform="rotate(-25 33 22)" />
      </svg>
    </div>
  );
}

const BALLOON_COLORS = ['#e63946', '#f4a300', '#2b93dc', '#58b947', '#b04fd1', '#ff6fa5', '#18b8b8'];

/** Balões subindo (aniversário do dono). */
function Balloons({ onDone }: { readonly onDone: () => void }) {
  const balloons = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: rand(2, 96),
        size: rand(44, 86),
        duration: rand(7.5, 12),
        delay: rand(0, 3.5),
        color: BALLOON_COLORS[i % BALLOON_COLORS.length]!,
        sway: rand(-40, 40),
      })),
    [],
  );
  useEffect(() => {
    const timer = window.setTimeout(onDone, 16000);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return (
    <div className="egg-balloons">
      {balloons.map((b, i) => (
        <span
          key={i}
          className="egg-balloon"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size * 1.22,
              '--color': b.color,
              '--sway': `${b.sway}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Chapéu de formatura jogado para o alto, com a contagem para julho de 2027. */
function Graduation({
  origin,
  onDone,
}: {
  readonly origin: { readonly x: number; readonly y: number } | undefined;
  readonly onDone: () => void;
}) {
  const { t } = useI18n();
  const capRef = useRef<HTMLSpanElement>(null);
  const [days] = useState(() => Math.ceil((new Date(2027, 6, 1).getTime() - Date.now()) / 86_400_000));
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;

  useEffect(() => {
    const cap = capRef.current;
    const fly = cap?.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', offset: 0 },
        {
          transform: `translate(${(window.innerWidth / 2 - x) * 0.35}px, ${-Math.min(y - 40, 380)}px) rotate(540deg) scale(1.6)`,
          offset: 0.45,
        },
        { transform: `translate(${(window.innerWidth / 2 - x) * 0.5}px, 0) rotate(1020deg) scale(1)`, offset: 0.92 },
        { transform: `translate(${(window.innerWidth / 2 - x) * 0.5}px, 4px) rotate(1040deg) scale(1)`, offset: 1 },
      ],
      { duration: 2200, easing: 'cubic-bezier(0.3, 0.1, 0.5, 1)', fill: 'forwards' },
    );
    const timer = window.setTimeout(onDone, 5200);
    return () => {
      fly?.cancel();
      window.clearTimeout(timer);
    };
    // Uma única vez por montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <span ref={capRef} className="egg-cap" style={{ left: x - 28, top: y - 28 }}>
        <svg viewBox="0 0 64 64" width="56" height="56">
          <path d="M32 8 2 22l30 14 30-14Z" fill="#1f2937" stroke="#0b1220" strokeWidth="1.5" strokeLinejoin="round" />
          <path
            d="M14 30v12c0 5 8 9 18 9s18-4 18-9V30L32 38Z"
            fill="#374151"
            stroke="#0b1220"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M58 24v18" stroke="#f2bb4a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="58" cy="45" r="3.2" fill="#f2bb4a" />
        </svg>
      </span>
      <p className="egg-toast">{days > 0 ? t.eggs.graduationCountdown(days) : t.eggs.graduationDone}</p>
    </>
  );
}

/* --------------------- Corinthians nos Nanicos (zoação) ------------------ */

const PALESTRA_COLORS = ['#006437', '#0a8a4b', '#ffffff', '#e8f5ee', '#ffffff', '#22b768'];

/** Confete verde e branco caindo, com o grito do Palmeiras. */
const confetti: Factory = (ctx, width, height) => {
  const pieces = Array.from({ length: 170 }, () => ({
    x: rand(0, width),
    y: rand(-height, 0),
    w: rand(6, 13),
    h: rand(10, 20),
    vy: rand(110, 260),
    sway: rand(20, 70),
    phase: rand(0, 6.28),
    spin: rand(2, 7),
    color: PALESTRA_COLORS[Math.floor(Math.random() * PALESTRA_COLORS.length)]!,
  }));
  return (t, dt) => {
    ctx.clearRect(0, 0, width, height);
    for (const p of pieces) {
      p.y += p.vy * dt;
      if (p.y > height + 20) {
        p.y = -20;
        p.x = rand(0, width);
      }
      ctx.save();
      ctx.translate(p.x + Math.sin(t * 1.3 + p.phase) * p.sway, p.y);
      ctx.rotate(t * p.spin + p.phase);
      ctx.scale(1, Math.abs(Math.cos(t * p.spin * 0.7 + p.phase)) * 0.9 + 0.1);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  };
};

function Palestra({ onDone }: { readonly onDone: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <Canvas className="egg-canvas" duration={8} fadeIn={0.4} fadeOut={1.5} factory={confetti} onDone={onDone} />
      <p className="egg-banner">{t.eggs.avanti}</p>
    </>
  );
}

/* ------------------------- robô da OBR (linha preta) -------------------- */

/** O robô seguidor de linha da Olimpíada Brasileira de Robótica, percorrendo a pista preta. */
function ObrRobot({ onDone }: { readonly onDone: () => void }) {
  const pathRef = useRef<SVGPathElement>(null);
  const robotRef = useRef<SVGGElement>(null);
  const width = window.innerWidth;
  const height = window.innerHeight;
  // Pista: uma linha preta ondulada atravessando a tela, com curvas (como na prova).
  const d = useMemo(() => {
    const points: string[] = [];
    const base = height * 0.66;
    for (let x = -60; x <= width + 60; x += 10) {
      const y = base + Math.sin(x / (width / 6)) * height * 0.08 + Math.sin(x / (width / 2.2)) * height * 0.05;
      points.push(`${points.length === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [width, height]);

  useEffect(() => {
    const path = pathRef.current;
    const robot = robotRef.current;
    if (!path || !robot) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
    const duration = 7500;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const here = path.getPointAtLength(progress * length);
      const ahead = path.getPointAtLength(Math.min(length, progress * length + 6));
      const angle = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI;
      robot.setAttribute('transform', `translate(${here.x} ${here.y}) rotate(${angle})`);
      // A pista aparece à frente do robô (ele a "enxerga" pelo sensor).
      path.style.strokeDashoffset = String(length - Math.min(length, progress * length + 90));
      if (progress >= 1) onDone();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // Uma única vez por montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg className="egg-obr" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#111"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g ref={robotRef}>
        <rect x="-20" y="-19" width="22" height="8" rx="2" fill="#222" />
        <rect x="-20" y="11" width="22" height="8" rx="2" fill="#222" />
        <rect x="-24" y="-12" width="44" height="24" rx="4" fill="#f2bb4a" stroke="#8a5a17" strokeWidth="1.5" />
        <rect x="-18" y="-8" width="16" height="16" rx="2" fill="#2b93dc" stroke="#0b4a85" strokeWidth="1" />
        <rect x="-16" y="-6" width="12" height="4" rx="1" fill="#fff" opacity="0.5" />
        <rect x="18" y="-2.5" width="10" height="5" fill="#555" />
        <circle cx="30" cy="0" r="4.2" fill="#e2553a" stroke="#7a1f10" strokeWidth="1" />
        <circle cx="29" cy="-1.2" r="1.2" fill="#fff" opacity="0.8" />
      </g>
    </svg>
  );
}

/* ---------------------- lembrete de hidratação do Aquanauta ------------- */

/** O aviso "Hora de beber água!" do Aquanauta surge no canto, com uma gotinha d'água. */
function AquanautaReminder({ onDone }: { readonly onDone: () => void }) {
  useEffect(() => {
    playDrop();
    const timer = window.setTimeout(onDone, 7000);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return <img className="egg-reminder" src={reminder} alt="" width={478} height={152} onClick={onDone} />;
}
