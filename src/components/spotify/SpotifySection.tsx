import spotifyLogo from '../../assets/brands/spotify-logo.png';
import { useI18n } from '../../i18n/I18n';
import { useSpotify, useSpotifyRefresh } from '../../lib/spotify';
import type { Section } from '../../types/portfolio';
import { SectionHeader } from '../sections/SectionHeader';
import { Artwork, NowPlaying, SpotifyLinkOut, TrackRow, duration, useTimeAgo } from './SpotifyParts';
import './spotify.css';

/**
 * Aba Spotify: Meu perfil, Minha atividade (tocando agora + recentes),
 * Mais ouvidos nas últimas 4 semanas e, se ativado, Playlists públicas.
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

  return (
    <div className="sp-section">
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
            {/* ---------- Meu perfil ---------- */}
            <section className="info-panel sp-profile" aria-labelledby="sp-profile-title">
              <h2 id="sp-profile-title" className="group-title">
                {t.myProfile}
              </h2>
              <Artwork src={state.data.profile.image} size={120} round label={t.photoOf(state.data.profile.name)} />
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

          {/* ---------- Mais ouvidos ---------- */}
          {state.data.topArtists.length > 0 || state.data.topTracks.length > 0 ? (
            <section className="sp-top" aria-labelledby="sp-top-title">
              <h2 id="sp-top-title" className="group-title sp-top__title">
                {t.topTitle}
              </h2>
              {state.data.topArtists.length > 0 ? (
                <>
                  <h3 className="sp-subtitle">{t.artists}</h3>
                  <ul className="sp-artists">
                    {state.data.topArtists.map((artist, index) => (
                      <li key={artist.id}>
                        <SpotifyLinkOut href={artist.url} className="sp-artist">
                          <Artwork src={artist.image} size={96} round />
                          <span className="sp-artist__name">
                            <span className="sr-only">{t.rank(index + 1)}</span>
                            {artist.name}
                          </span>
                          {artist.genres[0] ? <span className="sp-artist__genre">{artist.genres[0]}</span> : null}
                        </SpotifyLinkOut>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {state.data.topTracks.length > 0 ? (
                <>
                  <h3 className="sp-subtitle">{t.tracks}</h3>
                  <ol className="sp-list sp-list--columns">
                    {state.data.topTracks.map((track, index) => (
                      <li key={track.id}>
                        <TrackRow track={track} index={index + 1} meta={duration(track.durationMs)} />
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
            </section>
          ) : null}

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
    </div>
  );
}
