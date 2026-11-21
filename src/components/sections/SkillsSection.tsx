import { useEffect, useId, useState } from 'react';
import { skillInfo } from '../../data/skillInfo';
import { techIcon } from '../../data/techIcons';
import { useI18n } from '../../i18n/I18n';
import type { Section, SkillGroup } from '../../types/portfolio';
import { SectionHeader } from './SectionHeader';

interface SkillsSectionProps {
  readonly section: Section;
  readonly skills: readonly SkillGroup[];
}

/**
 * Tecnologias, em grupos. Cada item com explicação (data/skillInfo.ts) é um
 * botão: clicar abre, logo abaixo dele, uma explicação curta do que é aquela
 * ferramenta. Uma de cada vez; Esc ou um novo clique fecham.
 */
export function SkillsSection({ section, skills }: SkillsSectionProps) {
  const { locale } = useI18n();
  const uid = useId();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="skills">
      <SectionHeader title={section.title ?? section.label} description={section.description} />
      <div className="skills__groups">
        {skills.map((group) => (
          <section key={group.title} className="skill-group" aria-labelledby={`skills-${slug(group.title)}`}>
            <h2 id={`skills-${slug(group.title)}`} className="group-title">
              {group.title}
            </h2>
            <ul className="skill-group__items">
              {group.items.map((item) => {
                const icon = techIcon(item);
                const info = skillInfo(item, locale);
                const key = `${group.title}/${item}`;
                const expanded = open === key;
                const panelId = `${uid}-${slug(key)}`;
                const face = (
                  <>
                    {icon ? (
                      <span className="skill-item__tile" aria-hidden="true">
                        <img src={icon} alt="" width={20} height={20} loading="lazy" decoding="async" />
                      </span>
                    ) : null}
                    <span className="skill-item__name">{item}</span>
                  </>
                );
                return (
                  <li key={item} className={`skill-entry${expanded ? ' is-open' : ''}`}>
                    {info ? (
                      <>
                        <button
                          type="button"
                          className={
                            icon ? 'skill-item skill-item--icon skill-item--button' : 'skill-item skill-item--button'
                          }
                          aria-expanded={expanded}
                          aria-controls={panelId}
                          onClick={() => setOpen(expanded ? null : key)}
                        >
                          {face}
                          <span className="skill-item__chevron" aria-hidden="true" />
                        </button>
                        {expanded ? (
                          <p id={panelId} className="skill-item__info">
                            {info}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <div className={icon ? 'skill-item skill-item--icon' : 'skill-item'}>{face}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}
