import { useEffect, useState } from 'react';
import { portfolio } from '../../data/portfolio';
import { useI18n } from '../../i18n/I18n';
import { duckAmbient } from '../../lib/ambient';
import type { SpotifyFavorites as Favorites } from '../../types/spotify';
import { Orb } from '../ui/Orb';
import { Artists, Artwork, SpotifyLinkOut } from './SpotifyParts';

/** Glifos brancos na grade do orbe: tocar e parar. */
const PREVIEW_PLAY = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5Z" fill="currentColor" />
  </svg>
);
const PREVIEW_STOP = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" />
  </svg>
);

const SLOTS = 10;

/** Aceita o ID ou o link do Spotify (open.spotify.com/track/ID ou spotify:track:ID). */
function spotifyId(value: string): string | null {
  const match = /([A-Za-z0-9]{22})(?:[?#].*)?$/.exec(value.trim());
  return match?.[1] ?? null;
}

type State =
  | { readonly status: 'empty' }
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: Favorites }
  | { readonly status: 'error' };

/**
 * Meu top 10: as músicas e os artistas escolhidos pelo dono (portfolio.ts →
 * spotify.favorites), com capa, nome e foto vindos do Spotify. Cada música tem
 * uma prévia: o player oficial do Spotify, carregado só quando pedido (um de
 * cada vez), e a música de fundo do site se cala enquanto ele está aberto.
 * Sem lista ainda, mostra as 10 vagas "em breve".
 */
export function SpotifyFavorites() {
  const { t } = useI18n();
  const config = portfolio.spotify.favorites;
  const trackIds = (config?.tracks ?? []).map(spotifyId).filter((id): id is string => id !== null);
  // Artista → álbum cuja capa vira o fundo do ladrilho (opcional).
  const albumOf = new Map<string, string>();
  const artistIds = (config?.artists ?? []).flatMap((entry) => {
    const id = spotifyId(typeof entry === 'string' ? entry : entry.artist);
    const album = typeof entry === 'string' || !entry.album ? null : spotifyId(entry.album);
    if (id && album) albumOf.set(id, album);
    return id ? [id] : [];
  });
  const query = `tracks=${trackIds.join(',')}&artists=${artistIds.join(',')}&albums=${[...new Set(albumOf.values())].join(',')}`;
  const hasList = trackIds.length > 0 || artistIds.length > 0;
  const [state, setState] = useState<State>(() => (hasList ? { status: 'loading' } : { status: 'empty' }));
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!hasList || !config) return;
    const controller = new AbortController();
    fetch(`${config.endpoint}?${query}`, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        setState({ status: 'ready', data: (await response.json()) as Favorites });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error' });
        if (!(error instanceof DOMException)) console.warn('[spotify top 10]', error);
      });
    return () => controller.abort();
  }, [hasList, config, query]);

  // Prévia aberta: a música de fundo se cala (o player do Spotify tem som próprio).
  useEffect(() => {
    duckAmbient('spotify-preview', preview !== null);
    return () => duckAmbient('spotify-preview', false);
  }, [preview]);

  const tracks = state.status === 'ready' ? state.data.tracks : [];
  const artists = state.status === 'ready' ? state.data.artists : [];
  const albumArt = new Map((state.status === 'ready' ? (state.data.albums ?? []) : []).map((a) => [a.id, a.image]));
  const backdropOf = (artistId: string): string | null => {
    const album = albumOf.get(artistId);
    return album ? (albumArt.get(album) ?? null) : null;
  };

  return (
    <section className="sp-top" aria-labelledby="sp-top-title">
      <h2 id="sp-top-title" className="group-title sp-top__title">
        {t.myTop10}
      </h2>
      <p className="sp-top__note">{t.top10Note}</p>
      {state.status === 'error' ? (
        <p className="sp-section__message" role="status">
          {t.spotifyUnreachable}
        </p>
      ) : null}

      <div className="sp-top__columns">
        <div>
          <h3 className="sp-subtitle">{t.top10Tracks}</h3>
          <ol className="sp-fav-tracks">
            {tracks.length > 0
              ? tracks.map((track, index) => (
                  <li
                    key={track.id}
                    className={
                      [track.image ? 'has-backdrop' : '', preview === track.id ? 'is-open' : ''].join(' ').trim() ||
                      undefined
                    }
                  >
                    {track.image ? (
                      <span
                        className="sp-fav-tracks__backdrop"
                        style={{ backgroundImage: `url("${track.image}")` }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="sp-fav-track">
                      <span className="sp-track__index" aria-hidden="true">
                        {index + 1}
                      </span>
                      <Artwork src={track.image} size={44} />
                      <SpotifyLinkOut href={track.url} className="sp-fav-track__text">
                        <span className="sp-track__name">
                          <span className="sr-only">{t.rank(index + 1)}</span>
                          {track.name}
                        </span>
                        <span className="sp-track__artists">
                          <Artists artists={track.artists} />
                        </span>
                      </SpotifyLinkOut>
                      <button
                        type="button"
                        className="sp-preview-button orb-host"
                        aria-expanded={preview === track.id}
                        aria-label={preview === track.id ? t.closePreview(track.name) : t.playPreview(track.name)}
                        title={preview === track.id ? t.closePreview(track.name) : t.playPreview(track.name)}
                        onClick={() => setPreview(preview === track.id ? null : track.id)}
                      >
                        <Orb variant={9} tone="green" size={40}>
                          {preview === track.id ? PREVIEW_STOP : PREVIEW_PLAY}
                        </Orb>
                      </button>
                    </div>
                    {preview === track.id ? (
                      <iframe
                        className="sp-embed"
                        title={t.playPreview(track.name)}
                        src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                        width="100%"
                        height="80"
                        loading="lazy"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      />
                    ) : null}
                  </li>
                ))
              : Array.from({ length: SLOTS }, (_, index) => (
                  <li key={index}>
                    <div
                      className={`sp-fav-track sp-fav-track--slot${state.status === 'loading' ? ' is-loading' : ''}`}
                    >
                      <span className="sp-track__index" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="sp-slot-art" aria-hidden="true" />
                      <span className="sp-slot-text">{t.comingSoon}</span>
                    </div>
                  </li>
                ))}
          </ol>
        </div>

        <div>
          <h3 className="sp-subtitle">{t.top10Artists}</h3>
          <ol className="sp-artists sp-fav-artists">
            {artists.length > 0
              ? artists.map((artist, index) => {
                  const backdrop = backdropOf(artist.id);
                  return (
                    <li key={artist.id} className={backdrop ? 'has-backdrop' : undefined}>
                      {backdrop ? (
                        <span
                          className="sp-fav-artists__backdrop"
                          style={{ backgroundImage: `url("${backdrop}")` }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <SpotifyLinkOut href={artist.url} className="sp-artist">
                        <span className="sp-fav-artists__photo">
                          <Artwork src={artist.image} size={96} round />
                          <span className="sp-fav-artists__rank" aria-hidden="true">
                            <Orb variant={9} tone="green" size={34}>
                              {index + 1}
                            </Orb>
                          </span>
                        </span>
                        <span className="sp-artist__name">
                          <span className="sr-only">{t.rank(index + 1)}</span>
                          {artist.name}
                        </span>
                      </SpotifyLinkOut>
                    </li>
                  );
                })
              : Array.from({ length: SLOTS }, (_, index) => (
                  <li key={index}>
                    <div className={`sp-artist sp-artist--slot${state.status === 'loading' ? ' is-loading' : ''}`}>
                      <span className="sp-fav-artists__photo">
                        <span className="sp-slot-art sp-slot-art--round" aria-hidden="true" />
                        <span className="sp-fav-artists__rank" aria-hidden="true">
                          {index + 1}
                        </span>
                      </span>
                      <span className="sp-artist__name">{t.comingSoon}</span>
                    </div>
                  </li>
                ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
