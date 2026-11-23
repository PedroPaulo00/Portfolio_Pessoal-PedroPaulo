import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { unlockAchievement } from '../../lib/achievements';
import { playScratch } from '../../lib/eggs';

/**
 * Easter eggs da aba Spotify.
 *
 * - `ScratchableArt`: arrastar a capa do "Ouvindo agora" para trás faz o disco
 *   girar e soar um "wicky-wicky" de DJ.
 * - `HeadphonesPhoto`: parar o mouse (ou o dedo) 5 segundos na foto do perfil
 *   coloca um fone de ouvido em pixel art nela.
 */

/**
 * Capa do "Ouvindo agora": um clique (ou Enter) abre o Windows Media Player;
 * arrastar para a esquerda "arranha" o disco (easter egg) e não conta como clique.
 */
export function ScratchableArt({
  children,
  label,
  onOpen,
}: {
  readonly children: ReactNode;
  /** Nome do botão (ex.: "Abrir no Windows Media Player"). */
  readonly label: string;
  readonly onOpen: () => void;
}) {
  const [angle, setAngle] = useState(0);
  const [released, setReleased] = useState(true);
  const drag = useRef<{ x: number; played: boolean; moved: boolean } | null>(null);
  const wasDrag = useRef(false);

  const onDown = (event: PointerEvent<HTMLSpanElement>) => {
    drag.current = { x: event.clientX, played: false, moved: false };
    wasDrag.current = false;
    setReleased(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    setAngle(Math.max(-110, Math.min(110, dx * 1.1)));
    if (dx < -45 && !d.played) {
      d.played = true;
      playScratch();
      unlockAchievement('scratch');
    }
  };
  const end = () => {
    wasDrag.current = drag.current?.moved ?? false;
    drag.current = null;
    setReleased(true);
    setAngle(0);
  };

  return (
    <span
      className={`sp-scratch${released ? ' is-released' : ''}`}
      style={{ transform: `rotate(${angle}deg)` }}
      role="button"
      tabIndex={0}
      aria-label={label}
      title={label}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerCancel={end}
      onClick={() => {
        if (!wasDrag.current) onOpen();
        wasDrag.current = false;
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      // Sem isso, arrastar a imagem inicia o "arrastar e soltar" nativo e cancela o gesto.
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </span>
  );
}

/** Pixels do arco do fone (grade 32×32), calculados uma vez. */
const BAND: readonly (readonly [number, number])[] = Array.from({ length: 31 }, (_, i) => {
  const a = Math.PI + (i / 30) * Math.PI;
  return [Math.round(16 + 13.5 * Math.cos(a)), Math.round(16 + 13.5 * Math.sin(a))] as const;
});

/** Foto do perfil que ganha um fone de ouvido depois de 5 s com o ponteiro em cima. */
export function HeadphonesPhoto({ children }: { readonly children: ReactNode }) {
  const [on, setOn] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stop = () => window.clearTimeout(timer.current);
  const start = () => {
    stop();
    timer.current = window.setTimeout(() => {
      setOn(true);
      unlockAchievement('headphones');
    }, 5000);
  };

  return (
    <span className="sp-headphones-host" onPointerEnter={start} onPointerLeave={stop} onPointerCancel={stop}>
      {children}
      {on ? (
        <svg className="sp-headphones" viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
          {BAND.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x - 1} y={y - 1} width="2" height="2" fill="#262a31" />
          ))}
          {BAND.filter((_, i) => i % 2 === 0).map(([x, y]) => (
            <rect key={`h${x}-${y}`} x={x - 1} y={y - 1} width="1" height="1" fill="#6b7280" />
          ))}
          {/* Conchas: verde do Spotify com a almofada escura. */}
          <rect x="0" y="12" width="5" height="11" fill="#1ed760" />
          <rect x="0" y="12" width="5" height="2" fill="#7bf0a4" />
          <rect x="4" y="13" width="2" height="9" fill="#262a31" />
          <rect x="27" y="12" width="5" height="11" fill="#1ed760" />
          <rect x="27" y="12" width="5" height="2" fill="#7bf0a4" />
          <rect x="26" y="13" width="2" height="9" fill="#262a31" />
        </svg>
      ) : null}
    </span>
  );
}
