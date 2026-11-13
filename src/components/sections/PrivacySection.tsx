import { useI18n } from '../../i18n/I18n';
import type { PrivacyPolicy, Section } from '../../types/portfolio';
import { SectionHeader } from './SectionHeader';

interface PrivacySectionProps {
  readonly section: Section;
  readonly privacy: PrivacyPolicy;
}

/** Política de privacidade (#privacidade): texto em portfolio.ts, nas duas línguas. */
export function PrivacySection({ section, privacy }: PrivacySectionProps) {
  const { t, intl } = useI18n();
  const updated = new Intl.DateTimeFormat(intl, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${privacy.updated}T00:00:00Z`),
  );

  return (
    <div className="privacy">
      <SectionHeader title={section.label} description={section.description} />
      <div className="privacy__body">
        <p>{privacy.intro}</p>
        {privacy.sections.map((item) => (
          <section key={item.title} className="privacy__block">
            <h2 className="group-title">{item.title}</h2>
            {item.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <p className="privacy__updated">{t.lastUpdated(updated)}</p>
      </div>
    </div>
  );
}
