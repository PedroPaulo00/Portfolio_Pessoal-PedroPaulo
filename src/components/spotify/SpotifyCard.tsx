import { RouteLink } from '../../lib/navigation';
import { useI18n } from '../../i18n/I18n';
import { useSpotify } from '../../lib/spotify';
import { Icon } from '../ui/Icon';
import { Artwork, NowPlaying, SpotifyLinkOut, TrackRow, useTimeAgo } from './SpotifyParts';
import './spotify.css';

/**
 * Cartão do Spotify no Início: perfil + o que está tocando (ou a última faixa).
 * Só aparece com dados em mãos: sem esqueleto que surge e some quando a API não
 * está configurada no site publicado.
 */
export function SpotifyCard() {
  const { t, intl } = useI18n();
  const timeAgo = useTimeAgo();
  const state = useSpotify();
  if (state.status !== 'ready') return null;
  const { profile, nowPlaying, recent } = state.data;
  const last = recent[0];

  return (
    <section className="sp-card" aria-labelledby="sp-card-title">
      <header className="sp-card__header">
        <h2 id="sp-card-title" className="group-title sp-card__title">
          <Icon name="spotify" size={20} />
          {t.onSpotify}
        </h2>
        {state.demo ? <span className="sp-demo-tag">{t.sampleData}</span> : null}
      </header>

      <div className="sp-card__body">
        <SpotifyLinkOut href={profile.url} className="sp-card__profile">
          <Artwork src={profile.image} size={56} round label={t.photoOf(profile.name)} />
          <span className="sp-card__who">
            <span className="sp-card__name">{profile.name}</span>
            {profile.followers !== null ? (
              <span className="sp-card__meta">
                {t.followersCount(profile.followers, profile.followers.toLocaleString(intl))}
              </span>
            ) : null}
          </span>
        </SpotifyLinkOut>

        <div className="sp-card__activity">
          {nowPlaying ? (
            <NowPlaying nowPlaying={nowPlaying} receivedAt={state.receivedAt} compact />
          ) : last ? (
            <>
              <p className="sp-card__label">{t.lastPlayed}</p>
              <TrackRow track={last.track} meta={timeAgo(last.playedAt)} />
            </>
          ) : (
            <p className="sp-card__label">{t.noActivity}</p>
          )}
        </div>

        <RouteLink to={{ section: 'spotify' }} className="aero-button sp-card__more">
          {t.seeActivity}
        </RouteLink>
      </div>
    </section>
  );
}
