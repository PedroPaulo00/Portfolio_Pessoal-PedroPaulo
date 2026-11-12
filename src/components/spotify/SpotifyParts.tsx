import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { SpotifyLink, SpotifyNowPlaying, SpotifyTrack } from '../../types/spotify';

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** "há 5 minutos" / "5 minutes ago", "ontem" / "yesterday"… no idioma atual. */
export function useTimeAgo(): (iso: string) => string {
  const { intl, t } = useI18n();
  return useMemo(() => {
    const relative = new Intl.RelativeTimeFormat(intl, { numeric: 'auto' });
    return (iso: string) => {
      const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
      for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
      }
      return t.justNow;
    };
  }, [intl, t]);
}

export function duration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Link externo para o Spotify (nova aba), com aviso para leitores de tela. */
export function SpotifyLinkOut({
  href,
  className,
  children,
}: {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  const { t } = useI18n();
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only">{t.opensInSpotify}</span>
    </a>
  );
}

/** Capa/foto com substituto no estilo Aero quando não há imagem. */
export function Artwork({
  src,
  size,
  round = false,
  label,
}: {
  readonly src: string | null;
  readonly size: number;
  readonly round?: boolean;
  readonly label?: string;
}) {
  const className = `sp-art${round ? ' sp-art--round' : ''}`;
  // Tamanho padrão via variável CSS: cada contexto/tela pode sobrescrevê-lo com
  // --art-size (um width inline venceria qualquer regra responsiva).
  const style = { '--art-default': `${size}px` } as CSSProperties;
  if (!src) {
    return (
      <span className={`${className} sp-art--empty`} style={style} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M9 17V6l10-2v11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="7" cy="17" r="2.4" fill="currentColor" />
          <circle cx="17" cy="15" r="2.4" fill="currentColor" />
        </svg>
      </span>
    );
  }
  return (
    <img
      className={className}
      style={style}
      src={src}
      alt={label ?? ''}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

export function Artists({ artists }: { readonly artists: readonly SpotifyLink[] }) {
  return <>{artists.map((artist) => artist.name).join(', ')}</>;
}

/** Linha de faixa: capa, nome, artistas e um metadado à direita. */
export function TrackRow({
  track,
  meta,
  index,
}: {
  readonly track: SpotifyTrack;
  readonly meta?: ReactNode;
  readonly index?: number;
}) {
  return (
    <SpotifyLinkOut href={track.url} className="sp-track">
      {index !== undefined ? (
        <span className="sp-track__index" aria-hidden="true">
          {index}
        </span>
      ) : null}
      <Artwork src={track.image} size={44} />
      <span className="sp-track__text">
        <span className="sp-track__name">{track.name}</span>
        <span className="sp-track__artists">
          <Artists artists={track.artists} />
        </span>
      </span>
      {meta ? <span className="sp-track__meta">{meta}</span> : null}
    </SpotifyLinkOut>
  );
}

/** Progresso local entre atualizações do servidor (avança a cada segundo). */
function useLiveProgress(now: SpotifyNowPlaying, receivedAt: number): number {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (!now.isPlaying) return;
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [now.isPlaying]);
  const elapsed = now.isPlaying ? Math.max(0, tick - receivedAt) : 0;
  return Math.min(now.track.durationMs, now.progressMs + elapsed);
}

export function NowPlaying({
  nowPlaying,
  receivedAt,
  compact = false,
}: {
  readonly nowPlaying: SpotifyNowPlaying;
  readonly receivedAt: number;
  readonly compact?: boolean;
}) {
  const { t } = useI18n();
  const progress = useLiveProgress(nowPlaying, receivedAt);
  const { track } = nowPlaying;
  const percent = track.durationMs ? (progress / track.durationMs) * 100 : 0;

  return (
    <div className={`sp-now${compact ? ' sp-now--compact' : ''}`}>
      <Artwork src={track.image} size={compact ? 56 : 112} label={t.coverOf(track.album)} />
      <div className="sp-now__body">
        <p className="sp-now__state">
          <span className={`sp-now__badge${nowPlaying.isPlaying ? '' : ' is-paused'}`}>
            {nowPlaying.isPlaying ? t.listeningNow : t.paused}
          </span>
        </p>
        <SpotifyLinkOut href={track.url} className="sp-now__title">
          {track.name}
        </SpotifyLinkOut>
        <p className="sp-now__artists">
          <Artists artists={track.artists} />
          {compact ? null : <span className="sp-now__album"> · {track.album}</span>}
        </p>
        <div className="sp-progress">
          <span className="sp-progress__time">{duration(progress)}</span>
          {/* Visual; os tempos ao lado já informam a posição. */}
          <span className="sp-progress__bar" aria-hidden="true">
            <span className="sp-progress__fill" style={{ width: `${percent}%` }} />
          </span>
          <span className="sp-progress__time">{duration(track.durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
