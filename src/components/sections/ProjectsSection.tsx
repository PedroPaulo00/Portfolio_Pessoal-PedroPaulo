import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { UiStrings } from '../../i18n/ui';
import type { Project, ProjectCategory, Section } from '../../types/portfolio';
import { AeroDialog } from '../ui/AeroDialog';
import { Icon } from '../ui/Icon';
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

      <AeroDialog
        wide
        open={detailed !== null}
        title={detailed?.name ?? ''}
        onClose={() => setDetailed(null)}
        actions={
          detailed ? (
            <>
              {detailed.demoUrl ? (
                <a
                  className="aero-button aero-button--primary"
                  href={detailed.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.demo}
                  <span className="sr-only">{t.opensNewTab}</span>
                </a>
              ) : null}
              {detailed.repositoryUrl ? (
                <a className="aero-button" href={detailed.repositoryUrl} target="_blank" rel="noreferrer">
                  {t.repository}
                  <span className="sr-only">{t.opensNewTab}</span>
                </a>
              ) : null}
            </>
          ) : null
        }
      >
        {detailed ? <ProjectDetails project={detailed} /> : null}
      </AeroDialog>
    </div>
  );
}

/**
 * Conteúdo do diálogo de detalhes: faixa de identidade (logo, nome, selos e a
 * capa esmaecida ao fundo), texto em parágrafos, tecnologias e capturas.
 * Em portfolio.ts, uma linha em branco ("\n\n") em `details` separa parágrafos.
 */
function ProjectDetails({ project }: { readonly project: Project }) {
  const { t } = useI18n();
  const paragraphs = (project.details ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="project-details">
      <header className="project-details__head">
        {project.thumbnail ? (
          <img className="project-details__cover" src={project.thumbnail.src} alt="" aria-hidden="true" />
        ) : null}
        {project.logo ? (
          <img className="project-details__logo" src={project.logo} alt="" width={72} height={72} />
        ) : (
          <span className="project-details__logo project-details__logo--icon">
            <Icon name={project.category} size={44} />
          </span>
        )}
        <div className="project-details__identity">
          <p className="project-details__name">{project.name}</p>
          <div className="project-card__meta">
            <span className={`badge badge--${project.category}`}>{t.category[project.category].singular}</span>
            {project.status ? (
              <span className={`badge badge--status badge--status-${project.status}`}>
                {t.projectStatus[project.status]}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {paragraphs.length > 0 ? (
        <section className="project-details__section">
          <h3 className="project-details__title">{t.aboutProject}</h3>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {project.stack.length > 0 ? (
        <section className="project-details__section">
          <h3 className="project-details__title">{t.technologiesUsed}</h3>
          <ul className="chip-list">
            {project.stack.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.gallery && project.gallery.length > 0 ? (
        <section className="project-details__section">
          <h3 className="project-details__title">{t.screenshots}</h3>
          <ul className="project-gallery">
            {project.gallery.map((image) => (
              <li key={image.src}>
                <a className="project-gallery__link" href={image.src} target="_blank" rel="noreferrer">
                  <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                  <span className="sr-only">{t.opensImage}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
