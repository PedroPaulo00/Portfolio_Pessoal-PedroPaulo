import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { UiStrings } from '../../i18n/ui';
import type { ProjectView } from '../../lib/projectView';
import type { Project, ProjectCategory, Section } from '../../types/portfolio';
import { AeroDialog } from '../ui/AeroDialog';
import { Icon } from '../ui/Icon';
import { ProjectCard } from './ProjectCard';
import { ProjectThumbnail } from './ProjectThumbnail';
import { SectionHeader } from './SectionHeader';

interface ProjectsSectionProps {
  readonly section: Section;
  readonly projects: readonly Project[];
  readonly category: ProjectCategory | undefined;
  readonly query: string;
  readonly onClearQuery: () => void;
  /** Modo de exibição escolhido em "Visualizar" (barra de comandos). */
  readonly view: ProjectView;
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

export function ProjectsSection({ section, projects, category, query, onClearQuery, view }: ProjectsSectionProps) {
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

      {visible.length === 0 ? null : view === 'extra-large' || view === 'large' ? (
        // Cartão completo (resumo, tecnologias e botões).
        <ul className={`project-grid project-grid--${view}`}>
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} onShowDetails={setDetailed} />
            </li>
          ))}
        </ul>
      ) : view === 'details' ? (
        <ProjectTable projects={visible} onOpen={setDetailed} />
      ) : (
        // Modos compactos: o item inteiro abre os detalhes do projeto.
        <ul className={`project-view project-view--${view}`}>
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectItem project={project} view={view} onOpen={setDetailed} />
            </li>
          ))}
        </ul>
      )}

      {visible.length > 0 ? null : (
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

/** Logo do projeto ou, na falta dele, o ícone da categoria. */
function ProjectIcon({ project, size }: { readonly project: Project; readonly size: number }) {
  return project.logo ? (
    <img className="project-item__icon" src={project.logo} alt="" width={size} height={size} loading="lazy" />
  ) : (
    <span className="project-item__icon">
      <Icon name={project.category} size={size} />
    </span>
  );
}

interface ProjectItemProps {
  readonly project: Project;
  readonly view: Exclude<ProjectView, 'extra-large' | 'large' | 'details'>;
  readonly onOpen: (project: Project) => void;
}

/**
 * Item dos modos compactos do "Visualizar" (ícones médios e pequenos, lista,
 * lado a lado e conteúdo). É um botão: abre os detalhes, onde ficam o texto
 * completo e os links de demonstração e repositório.
 */
function ProjectItem({ project, view, onOpen }: ProjectItemProps) {
  const { t } = useI18n();
  const category = t.category[project.category].singular;
  const status = project.status ? t.projectStatus[project.status] : null;
  const withCover = view === 'medium' || view === 'content';

  return (
    <button type="button" className="project-item" aria-haspopup="dialog" onClick={() => onOpen(project)}>
      {withCover ? (
        <span className="project-item__cover" aria-hidden="true">
          <ProjectThumbnail project={project} />
        </span>
      ) : (
        <ProjectIcon project={project} size={view === 'tiles' ? 48 : 20} />
      )}
      <span className="project-item__text">
        <span className="project-item__name">{project.name}</span>
        {view === 'tiles' ? (
          <span className="project-item__meta">
            {category}
            {status ? ` · ${status}` : ''}
          </span>
        ) : null}
        {view === 'content' ? <span className="project-item__summary">{project.summary}</span> : null}
      </span>
      {view === 'content' ? (
        <span className="project-item__side">
          <span className={`badge badge--${project.category}`}>{category}</span>
          {status ? <span className={`badge badge--status badge--status-${project.status}`}>{status}</span> : null}
        </span>
      ) : null}
    </button>
  );
}

/** Modo "Detalhes": tabela com colunas, como no Explorer. O nome abre os detalhes. */
function ProjectTable({
  projects,
  onOpen,
}: {
  readonly projects: readonly Project[];
  readonly onOpen: (project: Project) => void;
}) {
  const { t } = useI18n();
  return (
    <table className="project-table">
      <thead>
        <tr>
          <th scope="col">{t.columnName}</th>
          <th scope="col">{t.columnCategory}</th>
          <th scope="col">{t.columnStatus}</th>
          <th scope="col" className="project-table__stack">
            {t.columnStack}
          </th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <th scope="row">
              <button
                type="button"
                className="project-item project-item--row"
                aria-haspopup="dialog"
                onClick={() => onOpen(project)}
              >
                <ProjectIcon project={project} size={20} />
                <span className="project-item__name">{project.name}</span>
              </button>
            </th>
            <td>{t.category[project.category].singular}</td>
            <td>
              {project.status ? (
                <span className={`project-table__status badge--status-${project.status}`}>
                  {t.projectStatus[project.status]}
                </span>
              ) : null}
            </td>
            <td className="project-table__stack">{project.stack.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
