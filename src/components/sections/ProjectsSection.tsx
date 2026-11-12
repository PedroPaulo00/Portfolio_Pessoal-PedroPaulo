import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { UiStrings } from '../../i18n/ui';
import type { Project, ProjectCategory, Section } from '../../types/portfolio';
import { AeroDialog } from '../ui/AeroDialog';
import { ProjectCard } from './ProjectCard';
import { SectionHeader } from './SectionHeader';

interface ProjectsSectionProps {
  readonly section: Section;
  readonly projects: readonly Project[];
  readonly category: ProjectCategory | undefined;
  readonly query: string;
  readonly onClearQuery: () => void;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Busca no idioma exibido: nome, textos, categoria, estado e tecnologias. */
export function matchesQuery(project: Project, query: string, t: UiStrings): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(
    [
      project.name,
      project.summary,
      project.details ?? '',
      t.category[project.category].singular,
      project.status ? t.projectStatus[project.status] : '',
      ...project.stack,
    ].join(' '),
  );
  return terms.every((term) => haystack.includes(term));
}

export function ProjectsSection({ section, projects, category, query, onClearQuery }: ProjectsSectionProps) {
  const { t } = useI18n();
  const [detailed, setDetailed] = useState<Project | null>(null);

  const visible = useMemo(
    () => projects.filter((project) => (!category || project.category === category) && matchesQuery(project, query, t)),
    [projects, category, query, t],
  );

  const title = category ? t.projectsOf(t.category[category].plural) : (section.title ?? section.label);
  const trimmed = query.trim();

  return (
    <div className="projects">
      <SectionHeader title={title} description={section.description} />

      {trimmed ? (
        <div className="search-summary" role="status">
          <span>
            {t.resultsFor} <strong>“{trimmed}”</strong>
            {category ? t.inCategory(t.category[category].plural) : ''}
          </span>
          <button type="button" className="aero-button aero-button--small" onClick={onClearQuery}>
            {t.clearSearch}
          </button>
        </div>
      ) : null}

      {visible.length > 0 ? (
        <ul className="project-grid">
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} onShowDetails={setDetailed} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p className="empty-state__title">{t.noProjects}</p>
          <p>{trimmed ? t.tryAnotherTerm : t.emptyCategory}</p>
        </div>
      )}

      <AeroDialog open={detailed !== null} title={detailed?.name ?? ''} onClose={() => setDetailed(null)}>
        {detailed ? (
          <>
            <p className="dialog-meta">
              {t.category[detailed.category].singular}
              {detailed.status ? ` · ${t.projectStatus[detailed.status]}` : ''}
            </p>
            <p>{detailed.details}</p>
            {detailed.gallery && detailed.gallery.length > 0 ? (
              <ul className="project-gallery" aria-label={t.screenshots}>
                {detailed.gallery.map((image) => (
                  <li key={image.src}>
                    <a className="project-gallery__link" href={image.src} target="_blank" rel="noreferrer">
                      <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                      <span className="sr-only">{t.opensImage}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </AeroDialog>
    </div>
  );
}
