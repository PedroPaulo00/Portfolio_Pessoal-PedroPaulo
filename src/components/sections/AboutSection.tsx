import { useRef, type ReactNode } from 'react';
import { playEffect } from '../../lib/eggBus';
import { useI18n } from '../../i18n/I18n';
import type { About, AboutFactKind, LanguageFlag, Profile, Section } from '../../types/portfolio';
import { PhotoCarousel } from './PhotoCarousel';
import { SectionHeader } from './SectionHeader';

interface AboutSectionProps {
  readonly section: Section;
  readonly about: About;
  readonly profile: Profile;
}

/** Vagas do carrossel enquanto não houver fotos. */
const PHOTO_SLOTS = 5;

/**
 * Sobre, em cartões separados (como os painéis do Windows 7): ficha rápida com
 * foto, carrossel de fotos, minha história, destaques, formação, interesses e
 * idiomas. No computador, história e destaques à esquerda e o resto à direita;
 * no celular, tudo em uma coluna, um cartão por vez.
 */
export function AboutSection({ section, about, profile }: AboutSectionProps) {
  const { t } = useI18n();
  const highlights = about.highlights ?? [];
  const languages = about.languages ?? [];
  // Itens da ficha sem valor (ainda não preenchidos) não aparecem.
  const facts = (about.facts ?? []).filter((fact) => fact.value);

  return (
    <div className="about">
      <SectionHeader title={section.title ?? section.label} description={section.description} />

      <section className="about-card about-profile" aria-labelledby="about-facts">
        <CardTitle id="about-facts" icon="profile">
          {t.quickFacts}
        </CardTitle>
        <div className="about-profile__body">
          {profile.photo ? (
            <img
              className="about-profile__photo"
              src={profile.photo.src}
              alt={profile.photo.alt}
              width={96}
              height={96}
            />
          ) : null}
          <div className="about-profile__who">
            <p className="about-profile__name">{profile.name}</p>
            <p className="about-profile__role">{profile.role}</p>
          </div>
        </div>
        {facts.length > 0 ? (
          <dl className="about-facts">
            {facts.map((fact) => (
              <div key={fact.kind} className="about-facts__item">
                <dt>
                  <FactIcon kind={fact.kind} />
                  {fact.label}
                </dt>
                <dd>
                  {fact.kind === 'born' ? (
                    // Easter egg: clicar na cidade faz nevar (Guarapuava é uma das mais frias do Paraná).
                    <button type="button" className="about-facts__secret" onClick={() => playEffect('snow')}>
                      {fact.value}
                    </button>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="about-card about-photos" aria-labelledby="about-photos">
        <CardTitle id="about-photos" icon="camera">
          {t.photos}
        </CardTitle>
        <PhotoCarousel photos={about.photos ?? []} slots={PHOTO_SLOTS} />
      </section>

      <div className="about__layout">
        <div className="about__text">
          <section className="about-card" aria-labelledby="about-story">
            <CardTitle id="about-story" icon="book">
              {t.myStory}
            </CardTitle>
            <div className="about-card__prose">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
          {highlights.length > 0 ? (
            <section className="about-card" aria-labelledby="about-highlights">
              <CardTitle id="about-highlights" icon="trophy">
                {t.highlights}
              </CardTitle>
              <ul className="about-highlights">
                {highlights.map((item) => (
                  <li key={item}>{/OBR/.test(item) ? <RobotSecret text={item} /> : item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="about__aside">
          {about.education ? (
            <section className="about-card about-card--education" aria-labelledby="about-education">
              <CardTitle id="about-education" icon="cap" onIconClick={(origin) => playEffect('graduation', origin)}>
                {t.education}
              </CardTitle>
              <p className="about__course">{about.education.course}</p>
              {about.education.stage ? <p className="about__stage">{about.education.stage}</p> : null}
            </section>
          ) : null}
          {about.interests.length > 0 ? (
            <section className="about-card" aria-labelledby="about-interests">
              <CardTitle id="about-interests" icon="star">
                {t.interests}
              </CardTitle>
              <ul className="chip-list">
                {about.interests.map((interest) => (
                  <li key={interest} className="chip">
                    {interest}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {languages.length > 0 ? (
            <section className="about-card" aria-labelledby="about-languages">
              <CardTitle id="about-languages" icon="globe">
                {t.languages}
              </CardTitle>
              <ul className="about-languages">
                {languages.map((language) => (
                  <li key={language.label}>
                    {language.flag ? <Flag code={language.flag} /> : null}
                    {language.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type CardIconName = 'profile' | 'camera' | 'book' | 'trophy' | 'cap' | 'star' | 'globe';

/** Título do cartão com um pequeno ícone, no estilo dos cabeçalhos de painel. */
/**
 * Easter egg: três cliques seguidos numa conquista da OBR (Olimpíada Brasileira de
 * Robótica) soltam o robô seguidor de linha pela tela.
 */
function RobotSecret({ text }: { readonly text: string }) {
  const clicks = useRef<number[]>([]);
  return (
    <button
      type="button"
      className="about-facts__secret"
      onClick={() => {
        const stamp = Date.now();
        clicks.current = [...clicks.current.filter((at) => stamp - at < 4000), stamp];
        if (clicks.current.length >= 3) {
          clicks.current = [];
          playEffect('obr');
        }
      }}
    >
      {text}
    </button>
  );
}

function CardTitle({
  id,
  icon,
  children,
  onIconClick,
}: {
  readonly id: string;
  readonly icon: CardIconName;
  readonly children: ReactNode;
  /** Easter egg: o ícone vira um botão escondido (fora do Tab e dos leitores de tela). */
  readonly onIconClick?: (origin: { x: number; y: number }) => void;
}) {
  const svg = (
    <svg className="about-card__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      {CARD_ICONS[icon]}
    </svg>
  );
  return (
    <h2 id={id} className="about-card__title">
      {onIconClick ? (
        <button
          type="button"
          className="about-card__icon-button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            onIconClick({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
          }}
        >
          {svg}
        </button>
      ) : (
        svg
      )}
      {children}
    </h2>
  );
}

const CARD_ICONS: Record<CardIconName, ReactNode> = {
  profile: (
    <>
      <circle cx="12" cy="8" r="4.2" fill="#5fa8e6" stroke="#1d5c94" />
      <path d="M3.8 21c.6-4.6 3.8-7.2 8.2-7.2s7.6 2.6 8.2 7.2Z" fill="#5fa8e6" stroke="#1d5c94" />
    </>
  ),
  camera: (
    <>
      <rect x="2.5" y="7" width="19" height="13" rx="2.5" fill="#8fc6ee" stroke="#1d5c94" />
      <path d="M8 7l1.6-2.6h4.8L16 7" fill="#8fc6ee" stroke="#1d5c94" />
      <circle cx="12" cy="13.5" r="3.6" fill="#fff" stroke="#1d5c94" />
    </>
  ),
  book: (
    <>
      <path d="M3 5.5c3-1.2 6-1 9 .8v14c-3-1.8-6-2-9-.8Z" fill="#f4bd4c" stroke="#a8701d" />
      <path d="M21 5.5c-3-1.2-6-1-9 .8v14c3-1.8 6-2 9-.8Z" fill="#ffe3a0" stroke="#a8701d" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3h10v5a5 5 0 0 1-10 0Z" fill="#f6c94c" stroke="#a8701d" />
      <path d="M7 5H4v1.5A3 3 0 0 0 7 9.5M17 5h3v1.5a3 3 0 0 1-3 3" fill="none" stroke="#a8701d" />
      <path d="M10.5 13h3v3.5h-3ZM8 17h8v3.5H8Z" fill="#f6c94c" stroke="#a8701d" />
    </>
  ),
  cap: (
    <>
      <path d="M12 4 1.8 9 12 14l10.2-5Z" fill="#3b6ea5" stroke="#1d3d63" />
      <path d="M6 11.2V16c3.6 2.6 8.4 2.6 12 0v-4.8L12 14Z" fill="#5b8fcb" stroke="#1d3d63" />
      <path d="M20.5 9.6V15" stroke="#f2b33d" strokeWidth="1.6" />
    </>
  ),
  star: (
    <path
      d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9Z"
      fill="#ffd257"
      stroke="#b07a12"
      strokeLinejoin="round"
    />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill="#7fc8f0" stroke="#1d5c94" />
      <path
        d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3C9.4 5.6 8.2 8.6 8.2 12s1.2 6.4 3.8 9"
        fill="none"
        stroke="#1d5c94"
      />
      <path d="M6 7.5c2.5 2 6 1 8 2.5s3 3 4.5 2" fill="none" stroke="#3fa34d" strokeWidth="1.6" />
    </>
  ),
};

/** Ícone de cada item da ficha rápida. */
function FactIcon({ kind }: { readonly kind: AboutFactKind }) {
  return (
    <svg className="about-facts__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {FACT_ICONS[kind]}
    </svg>
  );
}

const FACT_ICONS: Record<AboutFactKind, ReactNode> = {
  born: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" fill="#e8574a" stroke="#8f2219" />
      <circle cx="12" cy="9.5" r="2.6" fill="#fff" />
    </>
  ),
  lives: (
    <>
      <path d="M3 11.5 12 4l9 7.5" fill="none" stroke="#8f2219" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5.5 10v10h13V10" fill="#ffd99a" stroke="#a8701d" />
      <path d="M10 20v-5.5h4V20" fill="#5fa8e6" stroke="#1d5c94" />
    </>
  ),
  study: (
    <>
      <path d="M12 4 1.8 9 12 14l10.2-5Z" fill="#3b6ea5" stroke="#1d3d63" />
      <path d="M6 11.2V16c3.6 2.6 8.4 2.6 12 0v-4.8L12 14Z" fill="#5b8fcb" stroke="#1d3d63" />
    </>
  ),
  languages: (
    <>
      <circle cx="12" cy="12" r="9" fill="#7fc8f0" stroke="#1d5c94" />
      <path d="M3 12h18M12 3c4 4.8 4 13.2 0 18M12 3c-4 4.8-4 13.2 0 18" fill="none" stroke="#1d5c94" />
    </>
  ),
  passion: (
    <>
      <path d="M9 18V5l11-2v13" fill="none" stroke="#1d5c94" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="6.5" cy="18" r="3" fill="#5fa8e6" stroke="#1d5c94" />
      <circle cx="17.5" cy="16" r="3" fill="#5fa8e6" stroke="#1d5c94" />
    </>
  ),
  focus: (
    <>
      <rect x="2.5" y="4" width="19" height="15" rx="2.5" fill="#26323d" stroke="#0f1820" />
      <path
        d="m8 9-3 2.5L8 14M16 9l3 2.5-3 2.5M13.5 8l-3 7.5"
        fill="none"
        stroke="#7fe08a"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
};

/** Bandeirinha ao lado do idioma (decorativa: o nome do idioma já está escrito). */
function Flag({ code }: { readonly code: LanguageFlag }) {
  return (
    <svg className="about-flag" viewBox="0 0 30 20" width={24} height={16} aria-hidden="true">
      {FLAGS[code]}
    </svg>
  );
}

const US_STRIPES = Array.from({ length: 13 }, (_, index) =>
  index % 2 === 0 ? <rect key={index} y={(index * 20) / 13} width="30" height={20 / 13} fill="#b22234" /> : null,
);

const FLAGS: Record<LanguageFlag, ReactNode> = {
  // Brasil: verde, losango amarelo e círculo azul com a faixa branca.
  br: (
    <>
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2.2 27.6 10 15 17.8 2.4 10Z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.6" fill="#002776" />
      <path d="M10.5 9.1c3-.9 6.3-.6 9 .9" stroke="#fff" strokeWidth="0.9" fill="none" />
    </>
  ),
  // EUA: listras vermelhas e brancas e o cantão azul com estrelas.
  us: (
    <>
      <rect width="30" height="20" fill="#fff" />
      {US_STRIPES}
      <rect width="13" height={(20 * 7) / 13} fill="#3c3b6e" />
      {[2, 5, 8].map((y) =>
        [2, 5, 8, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y + 0.6} r="0.75" fill="#fff" />),
      )}
    </>
  ),
  // Espanha: vermelho, amarelo (faixa dupla) e vermelho.
  es: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
      <rect x="7" y="7.6" width="3.4" height="4.8" rx="0.8" fill="#aa151b" opacity="0.8" />
    </>
  ),
};
