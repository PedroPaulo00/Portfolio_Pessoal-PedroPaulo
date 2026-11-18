import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import skin from '../../assets/desktop/media-player-skin.webp';
import { useI18n } from '../../i18n/I18n';
import { duckAmbient } from '../../lib/ambient';
import './media-player.css';

interface MediaPlayerProps {
  /** Vídeos, na ordem (anterior/próximo dão a volta na lista). */
  readonly playlist: readonly string[];
  /** Janela minimizada: some (o som continua, como no Windows Media Player). */
  readonly minimized: boolean;
  readonly onMinimize: () => void;
  readonly onClose: () => void;
  /** Ícone de onde a janela sai (ao minimizar, vai para o botão dela na barra). */
  readonly anchor: DOMRect | null;
  /** Na frente das outras janelas abertas pelos ícones. */
  readonly front: boolean;
  /** Clicou na janela: vem para a frente. */
  readonly onActivate: () => void;
}

/*
 * Posições na skin original (399 × 439 px), em %. A tela é transparente: o
 * vídeo fica atrás da skin, e a moldura verde o recorta no formato da tela.
 */
const W = 399;
const H = 439;
const at = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `${((x - w / 2) / W) * 100}%`,
  top: `${((y - h / 2) / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});
const SCREEN: CSSProperties = {
  left: `${(94 / W) * 100}%`,
  top: `${(74 / H) * 100}%`,
  width: `${(218 / W) * 100}%`,
  height: `${(161 / H) * 100}%`,
};
const BUTTONS = {
  previous: at(145.5, 58, 21, 21),
  playPause: at(170.5, 58, 21, 21),
  stop: at(197, 58, 21, 21),
  next: at(221, 58, 21, 21),
  sidePrevious: at(48, 200, 18, 34),
  sideNext: at(356, 200, 18, 34),
  // Minimizar e fechar: maiores que os originais (11 px) e um pouco afastados.
  minimize: at(185, 26, 22, 18),
  close: at(213, 26, 22, 18),
};

/**
 * Windows Media Player com a skin "cabeça verde": o vídeo toca na tela da
 * cabeça; anterior, reproduzir/pausar, parar e próximo funcionam (e as setas
 * das laterais também trocam de vídeo). Minimizar recolhe para o ícone; fechar
 * para tudo. Enquanto o vídeo toca, a música de fundo do site se cala.
 * Dá para arrastar a skin pela tela, como uma janela de verdade.
 */
export function MediaPlayer({ playlist, minimized, onMinimize, onClose, anchor, front, onActivate }: MediaPlayerProps) {
  const { t } = useI18n();
  const m = t.mediaPlayer;
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [badge, setBadge] = useState(0); // muda a cada troca de vídeo: mostra "Vídeo X de N"
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Distância até o ícone (medida ao minimizar): a janela encolhe até ele.
  const [toIcon, setToIcon] = useState('0px 0px');
  const total = playlist.length;

  // Ao abrir: foco na janela e o primeiro vídeo já tocando (o clique no ícone libera o som).
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    videoRef.current?.play().catch(() => undefined);
  }, []);

  // Música de fundo calada enquanto o vídeo toca; volta ao pausar ou fechar.
  useEffect(() => {
    duckAmbient('media-player', playing);
  }, [playing]);
  useEffect(() => () => duckAmbient('media-player', false), []);

  // Página em segundo plano: pausa; ao voltar, continua se estava tocando.
  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.visibilityState === 'hidden') {
        resume = !video.paused;
        video.pause();
      } else if (resume) {
        void video.play().catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const go = (step: number) => {
    setTrack((current) => (current + step + total) % total);
    setBadge((current) => current + 1);
    // Mesmo vídeo (lista de um só): recomeça.
    if (total === 1 && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => undefined);
    }
  };
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };
  const stop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  // Arrastar pela skin (fora dos botões e da tela).
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onActivate();
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
    drag.current = { px: event.clientX, py: event.clientY, x: offset.x, y: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const limitX = window.innerWidth / 2;
    const limitY = window.innerHeight / 2;
    setOffset({
      x: Math.max(-limitX, Math.min(limitX, d.x + event.clientX - d.px)),
      y: Math.max(-limitY, Math.min(limitY, d.y + event.clientY - d.py)),
    });
  };
  const endDrag = () => {
    drag.current = null;
  };

  // Minimizar: encolhe em direção ao ícone da área de trabalho.
  const minimize = () => {
    const box = rootRef.current?.getBoundingClientRect();
    // Destino: o botão do player na barra de tarefas (ou, sem ele, o ícone).
    const target = document.querySelector('[data-task="media-player"]')?.getBoundingClientRect() ?? anchor;
    if (target && box) {
      setToIcon(
        `${Math.round(target.left + target.width / 2 - (box.left + box.width / 2))}px ${Math.round(target.top + target.height / 2 - (box.top + box.height / 2))}px`,
      );
    }
    onMinimize();
  };

  return (
    <div
      className={`wmp${minimized ? ' wmp--minimized' : ''}`}
      style={
        {
          '--wmp-x': `${offset.x}px`,
          '--wmp-y': `${offset.y}px`,
          '--wmp-to-icon': toIcon,
          zIndex: front ? 28 : 25,
        } as CSSProperties
      }
      inert={minimized}
    >
      <div
        ref={rootRef}
        className="wmp__skin"
        role="dialog"
        aria-label={m.title}
        tabIndex={-1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <div className="wmp__screen" style={SCREEN}>
          <video
            ref={videoRef}
            key={`video-${track}`}
            className="wmp__video"
            src={playlist[track]}
            autoPlay={badge > 0}
            playsInline
            preload="auto"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => (total > 1 ? go(1) : setPlaying(false))}
          />
          {!playing ? (
            <button type="button" className="wmp__big-play" aria-label={m.play} onClick={togglePlay}>
              <span aria-hidden="true" />
            </button>
          ) : null}
          {badge > 0 ? (
            <p className="wmp__badge" key={`badge-${badge}`} aria-live="polite">
              {m.track(track + 1, total)}
            </p>
          ) : null}
        </div>
        <img className="wmp__image" src={skin} alt="" draggable={false} />

        <button
          type="button"
          className="wmp__hit"
          style={BUTTONS.previous}
          aria-label={m.previous}
          title={m.previous}
          onClick={() => go(-1)}
        />
        <button
          type="button"
          className={`wmp__hit wmp__hit--toggle${playing ? '' : ' is-paused'}`}
          style={BUTTONS.playPause}
          aria-label={playing ? m.pause : m.play}
          title={playing ? m.pause : m.play}
          onClick={togglePlay}
        />
        <button
          type="button"
          className="wmp__hit"
          style={BUTTONS.stop}
          aria-label={m.stop}
          title={m.stop}
          onClick={stop}
        />
        <button
          type="button"
          className="wmp__hit"
          style={BUTTONS.next}
          aria-label={m.next}
          title={m.next}
          onClick={() => go(1)}
        />
        <button
          type="button"
          className="wmp__hit wmp__hit--side"
          style={BUTTONS.sidePrevious}
          aria-label={m.previous}
          title={m.previous}
          onClick={() => go(-1)}
        />
        <button
          type="button"
          className="wmp__hit wmp__hit--side"
          style={BUTTONS.sideNext}
          aria-label={m.next}
          title={m.next}
          onClick={() => go(1)}
        />

        <button
          type="button"
          className="wmp__window-button"
          style={BUTTONS.minimize}
          aria-label={m.minimize}
          title={m.minimize}
          onClick={minimize}
        >
          <span className="wmp__glyph wmp__glyph--minimize" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="wmp__window-button wmp__window-button--close"
          style={BUTTONS.close}
          aria-label={m.close}
          title={m.close}
          onClick={onClose}
        >
          <span className="wmp__glyph wmp__glyph--close" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
