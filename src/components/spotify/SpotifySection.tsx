import { useEffect, useRef, useState, type CSSProperties } from 'react';
import spotifyLogo from '../../assets/brands/spotify-logo.png';
import penguinDance from '../../assets/spotify/club-penguin-dance.webp';
import { unlockAchievement } from '../../lib/achievements';
import { portfolio } from '../../data/portfolio';
import { useI18n } from '../../i18n/I18n';
import { useSpotify, useSpotifyRefresh } from '../../lib/spotify';
import type { Section } from '../../types/portfolio';
import { SectionHeader } from '../sections/SectionHeader';
import type { SpotifyNowPlaying } from '../../types/spotify';
import { Artwork, NowPlaying, SpotifyLinkOut, TrackRow, useLiveProgress, useTimeAgo } from './SpotifyParts';
import { SpotifyFavorites } from './SpotifyFavorites';
import { HeadphonesPhoto } from './SpotifyEggs';
import './spotify.css';

/**
 * Aba Spotify: Meu perfil, Minha atividade (tocando agora + recentes), Meu top 10
 * (músicas e artistas escolhidos à mão) e, se ativado, Playlists públicas.
 */
export function SpotifySection({
  section,
  showPlaylists,
}: {
  readonly section: Section;
  readonly showPlaylists: boolean;
}) {
  const { t, intl } = useI18n();
  const timeAgo = useTimeAgo();
  const state = useSpotify();
  const { refresh, refreshing } = useSpotifyRefresh();
  const followers = state.status === 'ready' ? state.data.profile.followers : null;
  // Easter egg do pinguim: dança por alguns segundos depois do clique.
  const [dancing, setDancing] = useState(false);
  const danceTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(danceTimer.current), []);

  return (
    <div className="sp-section">
      {state.status === 'ready' && state.data.nowPlaying?.isPlaying && state.data.nowPlaying.bpm ? (
        <BeatBackground nowPlaying={state.data.nowPlaying} receivedAt={state.receivedAt} />
      ) : null}
      <div className="sp-section__head">
        <SectionHeader title={section.title ?? section.label} description={section.description} />
        <img className="sp-section__brand" src={spotifyLogo} alt={t.spotifyLogo} width={96} height={76} />
      </div>

      {state.status === 'loading' ? (
        <p className="sp-section__message" role="status">
          {t.spotifyLoading}
        </p>
      ) : null}

      {state.status === 'unavailable' || state.status === 'disabled' ? (
        <div className="empty-state" role="status">
          <p className="empty-state__title">{t.spotifyUnavailable}</p>
          <p>
            {state.status === 'unavailable' && state.reason === 'not-configured'
              ? t.spotifyNotConfigured
              : t.spotifyUnreachable}
          </p>
          {state.status === 'unavailable' && state.reason === 'error' ? (
            <button type="button" className="aero-button" aria-disabled={refreshing} onClick={refresh}>
              {refreshing ? t.trying : t.tryAgain}
            </button>
          ) : null}
        </div>
      ) : null}

      {state.status === 'ready' ? (
        <>
          {state.demo ? (
            <p className="sp-demo-banner" role="note">
              <strong>{t.sampleData}.</strong> {t.sampleDataNote}
            </p>
          ) : null}

          <div className="sp-grid">
            {/* ---------- Meu perfil (+ pinguim do Club Penguin, só no computador) ---------- */}
            <div className="sp-side">
              <section className="info-panel sp-profile" aria-labelledby="sp-profile-title">
                <h2 id="sp-profile-title" className="group-title">
                  {t.myProfile}
                </h2>
                <HeadphonesPhoto>
                  <Artwork src={state.data.profile.image} size={120} round label={t.photoOf(state.data.profile.name)} />
                </HeadphonesPhoto>
                <p className="sp-profile__name">{state.data.profile.name}</p>
                {typeof followers === 'number' || showPlaylists ? (
                  <dl className="sp-profile__stats">
                    {typeof followers === 'number' ? (
                      <div>
                        <dt>{t.followers}</dt>
                        <dd>{followers.toLocaleString(intl)}</dd>
                      </div>
                    ) : null}
                    {showPlaylists ? (
                      <div>
                        <dt>{t.publicPlaylists}</dt>
                        <dd>{state.data.playlists.length}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                {state.data.profile.url ? (
                  <a
                    className="aero-button aero-button--primary"
                    href={state.data.profile.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.openProfile}
                  </a>
                ) : null}
              </section>
              {/* Enfeite: imagem de fundo via CSS, para o celular nem baixar o arquivo. */}
              <span
                className={`sp-side__penguin${dancing ? ' is-dancing' : ''}`}
                style={dancing ? { backgroundImage: `url(${penguinDance})` } : undefined}
                aria-hidden="true"
                onPointerEnter={() => void (new Image().src = penguinDance)}
                onClick={() => {
                  // Easter egg: clicar no pinguim o faz dançar por uns segundos.
                  setDancing(true);
                  unlockAchievement('penguin');
                  window.clearTimeout(danceTimer.current);
                  danceTimer.current = window.setTimeout(() => setDancing(false), 9000);
                }}
              />
            </div>

            {/* ---------- Minha atividade ---------- */}
            <section className="sp-activity" aria-labelledby="sp-activity-title">
              <h2 id="sp-activity-title" className="group-title">
                {t.myActivity}
              </h2>
              {state.data.nowPlaying ? (
                <NowPlaying nowPlaying={state.data.nowPlaying} receivedAt={state.receivedAt} />
              ) : (
                <p className="sp-section__message">{t.nothingPlaying}</p>
              )}

              <h3 className="sp-subtitle">{t.recentlyPlayed}</h3>
              {state.data.recent.length > 0 ? (
                <ul className="sp-list">
                  {state.data.recent.map((item) => (
                    <li key={`${item.track.id}-${item.playedAt}`}>
                      <TrackRow track={item.track} meta={timeAgo(item.playedAt)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sp-section__message">{t.noHistory}</p>
              )}
            </section>
          </div>

          {/* ---------- Playlists ---------- */}
          {showPlaylists && state.data.playlists.length > 0 ? (
            <section className="sp-playlists" aria-labelledby="sp-playlists-title">
              <h2 id="sp-playlists-title" className="group-title">
                {t.publicPlaylists}
              </h2>
              <ul className="sp-playlist-grid">
                {state.data.playlists.map((playlist) => (
                  <li key={playlist.id}>
                    <SpotifyLinkOut href={playlist.url} className="sp-playlist">
                      <Artwork src={playlist.image} size={150} />
                      <span className="sp-playlist__name">{playlist.name}</span>
                      {playlist.tracks !== null ? (
                        <span className="sp-playlist__meta">{t.trackCount(playlist.tracks)}</span>
                      ) : null}
                    </SpotifyLinkOut>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      {/* ---------- Meu top 10 (escolhido à mão; independe da atividade) ---------- */}
      {portfolio.spotify.favorites ? <SpotifyFavorites /> : null}
    </div>
  );
}

/**
 * Fundo da aba Spotify pulsando no ritmo da música tocando agora (BPM do Deezer):
 * brilhos de água e luz (Frutiger Aero) que "batem" a cada tempo, ondas de luz que
 * se espalham a cada dois tempos e bolhas subindo. A fase acompanha a música.
 */
function BeatBackground({
  nowPlaying,
  receivedAt,
}: {
  readonly nowPlaying: SpotifyNowPlaying;
  readonly receivedAt: number;
}) {
  const progress = useLiveProgress(nowPlaying, receivedAt);
  const beatMs = 60_000 / (nowPlaying.bpm ?? 120);
  const style = {
    '--beat': `${beatMs.toFixed(1)}ms`,
    '--beat-delay': `${-(progress % beatMs).toFixed(0)}ms`,
    '--beat2-delay': `${-(progress % (beatMs * 2)).toFixed(0)}ms`,
  } as CSSProperties;
  return (
    <div className="sp-beat-bg" style={style} aria-hidden="true">
      <span className="sp-beat-bg__glow" />
      <span className="sp-beat-bg__rays" />
      <span className="sp-beat-bg__ring" />
      <span className="sp-beat-bg__ring sp-beat-bg__ring--late" />
      <span className="sp-beat-bg__bubbles">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </div>
  );
}
