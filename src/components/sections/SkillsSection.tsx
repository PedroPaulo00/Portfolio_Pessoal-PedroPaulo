import type { Section, SkillGroup } from '../../types/portfolio';
import { techIcon } from '../../data/techIcons';
import { SectionHeader } from './SectionHeader';

interface SkillsSectionProps {
  readonly section: Section;
  readonly skills: readonly SkillGroup[];
}

export function SkillsSection({ section, skills }: SkillsSectionProps) {
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
                return (
                  <li key={item} className={icon ? 'skill-item skill-item--icon' : 'skill-item'}>
                    {icon ? (
                      <span className="skill-item__tile" aria-hidden="true">
                        <img src={icon} alt="" width={20} height={20} loading="lazy" decoding="async" />
                      </span>
                    ) : null}
                    {item}
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
