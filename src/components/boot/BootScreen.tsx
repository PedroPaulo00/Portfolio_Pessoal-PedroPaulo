import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../i18n/I18n';
import './boot.css';

interface BootScreenProps {
  /** Vídeo da animação de inicialização (src/assets/video). */
  readonly videoSrc: string;
  /** Fundo da tela: paisagem animada em loop (sem som) e o quadro parado dela. */
  readonly backdropVideo: string;
  readonly backdropPoster: string;
  /** Som do vídeo segue o volume e o "mudo" salvos do site. */
  readonly muted: boolean;
  readonly volume: number;
  /** Assinatura no rodapé da tela: logo + nome do portfólio. */
  readonly brand: ReactNode;
  readonly title: string;
  /**
   * Fim da inicialização: a área de trabalho aparece. `byKeyboard` diz se o
   * visitante ligou (ou pulou) pelo teclado; nesse caso o App leva o foco ao
   * ícone Portfólio. Com mouse ou toque, não: o foco desenharia um anel nele.
   */
  readonly onDone: (byKeyboard: boolean) => void;
  /**
   * Reiniciar (menu Iniciar): pula o botão de ligar e toca o vídeo de
   * inicialização direto, como um computador que volta sozinho.
   */
  readonly autoStart?: boolean;
}

type Phase = 'off' | 'playing' | 'leaving';

/** Margens de segurança: vídeo que não começa / que não termina. */
const START_TIMEOUT_MS = 3500;
const MAX_BOOT_MS = 20_000;
const FADE_MS = 450;

/**
 * Primeira tela do site: o "computador desligado". Sobre uma paisagem animada e
 * escurecida, um orbe de vidro com o símbolo de energia (o material do botão
 * Iniciar) e um arco de luz girando em volta. O clique toca o vídeo de
 * inicialização; ao terminar, a tela se dissolve e revela a área de trabalho.
 *
 * Nunca prende o visitante: o vídeo é curto; se o aparelho não conseguir
 * tocá-lo (ou ele travar), segue direto; e com "movimento reduzido" ligado no
 * sistema, o vídeo nem toca e o fundo fica parado.
 */
export function BootScreen({
  videoSrc,
  backdropVideo,
  backdropPoster,
  muted,
  volume,
  brand,
  title,
  onDone,
  autoStart = false,
}: BootScreenProps) {
  const { t } = useI18n();
  // Com "movimento reduzido" no sistema, o fundo fica parado (e o vídeo não toca).
  const [animated] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase, setPhase] = useState<Phase>(() => (autoStart ? (animated ? 'playing' : 'leaving') : 'off'));
  const videoRef = useRef<HTMLVideoElement>(null);
  // Reiniciar veio de um clique no menu: sem anel de foco no ícone ao terminar.
  const byKeyboard = useRef(!autoStart);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    videoRef.current?.pause();
    setPhase('leaving');
  }, []);

  /**
   * Toca o vídeo com o som do site. Se o navegador recusar o som (alguns só
   * liberam áudio logo após um toque), tenta de novo sem som; se nem assim,
   * segue direto para a área de trabalho.
   */
  const startVideo = useCallback(
    (video: HTMLVideoElement) => {
      video.muted = muted;
      video.volume = Math.min(1, Math.max(0, volume / 100));
      video.play().catch(() => {
        if (video.muted) {
          finish();
          return;
        }
        video.muted = true;
        video.play().catch(finish);
      });
    },
    [muted, volume, finish],
  );

  const powerOn = () => {
    const video = videoRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!video || reducedMotion) {
      finish();
      return;
    }
    setPhase('playing');
    startVideo(video);
  };

  // Reiniciar: o vídeo começa sozinho, ao montar (só uma vez).
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStarted.current || !animated) return;
    autoStarted.current = true;
    const video = videoRef.current;
    if (video) startVideo(video);
    else finish();
  }, [autoStart, animated, startVideo, finish]);

  // Vídeo que não sai do lugar (formato não suportado, rede lenta) ou não acaba.
  useEffect(() => {
    if (phase !== 'playing') return;
    const stalled = window.setTimeout(() => {
      if ((videoRef.current?.currentTime ?? 0) < 0.05) finish();
    }, START_TIMEOUT_MS);
    const tooLong = window.setTimeout(finish, MAX_BOOT_MS);
    return () => {
      window.clearTimeout(stalled);
      window.clearTimeout(tooLong);
    };
  }, [phase, finish]);

  // Página em segundo plano (outra aba, navegador minimizado ou fechado): o vídeo
  // de inicialização, que tem som, pausa; ao voltar, continua de onde parou.
  useEffect(() => {
    if (phase !== 'playing') return;
    const sync = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.visibilityState === 'hidden') video.pause();
      else if (video.paused && !video.ended) video.play().catch(finish);
    };
    const onPageHide = () => videoRef.current?.pause();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [phase, finish]);

  // Dissolve e entrega a área de trabalho.
  useEffect(() => {
    if (phase !== 'leaving') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => done.current(byKeyboard.current), reducedMotion ? 0 : FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className={`boot boot--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.bootScreen}
      onPointerDown={() => {
        byKeyboard.current = false;
      }}
      onKeyDown={() => {
        byKeyboard.current = true;
      }}
    >
      {/* Cenário (só decoração): a paisagem animada, escurecida para destacar o orbe
          e o texto. Some ao ligar. A imagem parada fica por baixo: aparece enquanto
          o vídeo carrega e é o que se vê com "movimento reduzido". */}
      <div className="boot__scene" aria-hidden="true">
        <img className="boot__backdrop" src={backdropPoster} alt="" />
        {animated ? (
          <video
            className="boot__backdrop"
            src={backdropVideo}
            poster={backdropPoster}
            autoPlay
            muted
            loop
            playsInline
            tabIndex={-1}
          />
        ) : null}
      </div>

      <div className="boot__frame">
        <video
          ref={videoRef}
          className="boot__video"
          src={videoSrc}
          preload="auto"
          playsInline
          tabIndex={-1}
          aria-hidden="true"
          onEnded={finish}
          onError={() => {
            if (phase === 'playing') finish();
          }}
        />
      </div>

      {/* Fica montado durante o vídeo só para a saída animada; aí já está inerte. */}
      <div className="boot__stage" inert={phase !== 'off'}>
        <div className="boot__orb">
          <span className="boot__halo" aria-hidden="true" />
          <span className="boot__flash" aria-hidden="true" />
          {/* autoFocus: é a única ação da tela, então Enter já liga. */}
          <button type="button" className="boot__power" aria-label={t.powerOn} autoFocus onClick={powerOn}>
            <svg className="boot__glyph" viewBox="0 0 48 48" width="50" height="50" aria-hidden="true">
              <path
                d="M15.5 13.5a15 15 0 1 0 17 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.2"
                strokeLinecap="round"
              />
              <path d="M24 6v17" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="boot__hint">
          <span className="boot__hint-mouse">{t.powerHint}</span>
          <span className="boot__hint-touch">{t.powerHintTouch}</span>
        </p>
      </div>

      <p className="boot__brand" aria-hidden="true">
        {brand}
        <span>{title}</span>
      </p>
    </div>
  );
}
