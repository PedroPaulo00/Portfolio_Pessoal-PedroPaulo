import msnFrame from '../../assets/profile/msn-frame.svg';
import featureVideo from '../../assets/video/fundo-tcc.mp4';
import { useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { unlockAchievement } from '../../lib/achievements';
import { playEffect } from '../../lib/eggBus';
import { useSpotify } from '../../lib/spotify';
import { RouteLink } from '../../lib/navigation';
import { useVisitCount } from '../../lib/visits';
import type { FeaturedPhoto, Profile, Section } from '../../types/portfolio';
import { SpotifyCard } from '../spotify/SpotifyCard';
import { BrandMark } from '../ui/BrandMark';
import { Icon } from '../ui/Icon';
import { OrbLink, glyphs } from '../ui/OrbButton';

interface HeroSectionProps {
  readonly profile: Profile;
  readonly sections: readonly Section[];
  /** Destaque com foto (a apresentação do TCC), abaixo da apresentação. */
  readonly featured?: FeaturedPhoto | undefined;
}

export function HeroSection({ profile, sections, featured }: HeroSectionProps) {
  const { t, intl } = useI18n();
  const { count: visits, owner } = useVisitCount();
  const shortcuts = sections.filter((section) => section.id !== 'inicio');

  return (
    <div className="hero">
      <div className="hero__intro">
        {profile.photo ? (
          <div className="hero__avatar">
            <div className="msn-frame">
              <img
                className="msn-frame__photo"
                src={profile.photo.src}
                alt={profile.photo.alt}
                width={120}
                height={120}
              />
              <img className="msn-frame__art" src={msnFrame} alt="" width={116} height={116} />
            </div>
            <div className="hero__status">
              <PresenceStatus />
              {visits !== null ? (
                <p className="visit-counter">
                  <span className="visit-counter__icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="14" height="14">
                      <circle cx="5.6" cy="5" r="2.6" fill="#5fa8e6" stroke="#1d5c94" strokeWidth="0.8" />
                      <path
                        d="M1.2 13.6c.3-2.9 2.1-4.6 4.4-4.6s4.1 1.7 4.4 4.6Z"
                        fill="#5fa8e6"
                        stroke="#1d5c94"
                        strokeWidth="0.8"
                      />
                      <circle cx="11.1" cy="5.8" r="2.2" fill="#9fd36c" stroke="#3f7d2a" strokeWidth="0.8" />
                      <path
                        d="M8.7 13.6c.2-2.4 1-3.9 2.4-3.9 1.9 0 3.5 1.5 3.8 3.9Z"
                        fill="#9fd36c"
                        stroke="#3f7d2a"
                        strokeWidth="0.8"
                      />
                      <ellipse cx="5" cy="4" rx="1.3" ry="0.8" fill="#fff" opacity="0.6" />
                    </svg>
                  </span>
                  {t.visits(visits, new Intl.NumberFormat(intl).format(visits))}
                  {/* Só no navegador do dono (?naocontar): confirma que a marca continua lá. */}
                  {owner ? <span className="visit-counter__owner">{t.visitsNotCounted}</span> : null}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="hero__mark" aria-hidden="true">
            <BrandMark profile={profile} size={96} />
          </div>
        )}
        <div className="hero__text">
          <h1 className="hero__name" tabIndex={-1} data-view-heading>
            {profile.name}
          </h1>
          <p className="hero__role">{profile.role}</p>
          <p className="hero__tagline">{profile.tagline}</p>
          <div className="hero__actions">
            <OrbLink
              variant={1}
              tone="green"
              label={t.viewProjects}
              glyph={glyphs.folder}
              to={{ section: 'projetos' }}
            />
            <OrbLink variant={9} label={t.getInTouch} glyph={glyphs.mail} to={{ section: 'contato' }} />
          </div>
        </div>
      </div>

      {featured ? (
        <section className="hero-feature" aria-labelledby="hero-feature-title">
          {/* Fundo animado (água), sem som. Quem pede menos animação fica com a
              imagem parada do CSS (o 1º quadro). */}
          {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : (
            <video
              className="hero-feature__video"
              src={featureVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
            />
          )}
          <figure className="hero-feature__photo">
            <img
              src={featured.image.src}
              alt={featured.image.alt}
              width={280}
              height={280}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="hero-feature__text">
            <h2 id="hero-feature-title" className="hero-feature__title">
              {featured.title}
            </h2>
            <p>{featured.text}</p>
            <RouteLink to={{ section: 'projetos', category: 'academico' }} className="aero-button">
              {t.seeTccProject}
            </RouteLink>
          </div>
        </section>
      ) : null}

      <SpotifyCard />

      <section className="hero__shortcuts" aria-labelledby="hero-shortcuts-title">
        <h2 id="hero-shortcuts-title" className="group-title">
          {t.inThisPortfolio}
        </h2>
        <ul className="library-grid">
          {shortcuts.map((section) => (
            <li key={section.id}>
              <RouteLink to={{ section: section.id }} className="library-item">
                <Icon name={section.id} size={44} />
                <span className="library-item__text">
                  <span className="library-item__title">{section.label}</span>
                  <span className="library-item__meta">{section.description}</span>
                </span>
              </RouteLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type Presence = 'online' | 'busy' | 'away' | 'listening';

/**
 * Status "Online" do MSN. É um botão (easter egg): cada clique troca o status,
 * como no Messenger: Online, Ocupado, Ausente e, havendo música no Spotify,
 * "Ouvindo: [música]".
 */
function PresenceStatus() {
  const { t } = useI18n();
  const spotify = useSpotify();
  // Escolha manual do visitante (easter egg); sem ela, o status é automático.
  const [manual, setManual] = useState<Presence | null>(null);
  const clicks = useRef<number[]>([]);
  const playing =
    spotify.status === 'ready' && spotify.data.nowPlaying?.isPlaying ? spotify.data.nowPlaying.track : null;
  const lastSong = spotify.status === 'ready' ? (spotify.data.recent[0]?.track ?? null) : null;
  const song = playing ?? lastSong;
  // Ouvindo música agora: "Ouvindo: [música]". Senão, Online.
  const auto: Presence = playing ? 'listening' : 'online';
  const current = manual ?? auto;
  const cycle: readonly Presence[] = song ? ['online', 'busy', 'away', 'listening'] : ['online', 'busy', 'away'];
  const label = {
    online: t.online,
    busy: t.statusBusy,
    away: t.statusAway,
    listening: song ? t.statusListening(song.name) : t.online,
  }[current];

  return (
    <p className="presence-line">
      <button
        type="button"
        className={`presence presence--${current}`}
        title={t.changeStatus}
        onClick={() => {
          const next = cycle[(cycle.indexOf(current) + 1) % cycle.length] ?? 'online';
          setManual(next === auto ? null : next);
          unlockAchievement('msnStatus');
          // 10 cliques seguidos (em até 6 s): modo festa.
          const stamp = Date.now();
          clicks.current = [...clicks.current.filter((at) => stamp - at < 6000), stamp];
          if (clicks.current.length >= 10) {
            clicks.current = [];
            playEffect('party');
          }
        }}
      >
        <span className="presence__dot" aria-hidden="true" />
        <span className="sr-only">{t.status}</span>
        {label}
      </button>
    </p>
  );
}
