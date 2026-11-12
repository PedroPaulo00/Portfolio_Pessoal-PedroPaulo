import { useI18n } from '../../i18n/I18n';
import type { About, Section } from '../../types/portfolio';
import { SectionHeader } from './SectionHeader';

interface AboutSectionProps {
  readonly section: Section;
  readonly about: About;
}

export function AboutSection({ section, about }: AboutSectionProps) {
  const { t } = useI18n();
  const highlights = about.highlights ?? [];
  const languages = about.languages ?? [];

  return (
    <div className="about">
      <SectionHeader title={section.title ?? section.label} description={section.description} />
      <div className="about__layout">
        <div className="about__text">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {highlights.length > 0 ? (
            <section className="about__highlights" aria-labelledby="about-highlights">
              <h2 id="about-highlights" className="group-title">
                {t.highlights}
              </h2>
              <ul className="about__list">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="about__aside">
          {about.education ? (
            <section className="info-panel" aria-labelledby="about-education">
              <h2 id="about-education" className="group-title">
                {t.education}
              </h2>
              <p className="about__course">{about.education.course}</p>
              {about.education.stage ? <p className="about__stage">{about.education.stage}</p> : null}
            </section>
          ) : null}
          {about.interests.length > 0 ? (
            <section className="info-panel" aria-labelledby="about-interests">
              <h2 id="about-interests" className="group-title">
                {t.interests}
              </h2>
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
            <section className="info-panel" aria-labelledby="about-languages">
              <h2 id="about-languages" className="group-title">
                {t.languages}
              </h2>
              <ul className="about__list about__list--plain">
                {languages.map((language) => (
                  <li key={language}>{language}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
