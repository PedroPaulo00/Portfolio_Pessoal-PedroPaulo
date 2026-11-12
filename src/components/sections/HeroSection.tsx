import msnFrame from '../../assets/profile/msn-frame.svg';
import { useI18n } from '../../i18n/I18n';
import { RouteLink } from '../../lib/navigation';
import type { Profile, Section } from '../../types/portfolio';
import { SpotifyCard } from '../spotify/SpotifyCard';
import { BrandMark } from '../ui/BrandMark';
import { Icon } from '../ui/Icon';
import { OrbLink, glyphs } from '../ui/OrbButton';

interface HeroSectionProps {
  readonly profile: Profile;
  readonly sections: readonly Section[];
}

export function HeroSection({ profile, sections }: HeroSectionProps) {
  const { t } = useI18n();
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
            <p className="presence">
              <span className="presence__dot" aria-hidden="true" />
              <span className="sr-only">{t.status}</span>
              {t.online}
            </p>
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
            <OrbLink variant={1} label={t.viewProjects} glyph={glyphs.folder} to={{ section: 'projetos' }} />
            <OrbLink variant={9} label={t.getInTouch} glyph={glyphs.mail} to={{ section: 'contato' }} />
          </div>
        </div>
      </div>

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
