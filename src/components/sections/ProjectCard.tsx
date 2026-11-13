import { useI18n } from '../../i18n/I18n';
import type { Project } from '../../types/portfolio';
import { ProjectThumbnail } from './ProjectThumbnail';

interface ProjectCardProps {
  readonly project: Project;
  readonly onShowDetails: (project: Project) => void;
}

/**
 * Modelo ÚNICO de card. Todos os campos vêm de src/data/portfolio.ts.
 * Links ausentes não geram botões; "Detalhes" só aparece se `details` existir.
 */
export function ProjectCard({ project, onShowDetails }: ProjectCardProps) {
  const { t } = useI18n();
  const titleId = `projeto-${project.id}`;
  const hasActions = Boolean(project.repositoryUrl || project.demoUrl || project.details);

  return (
    <article className="project-card" aria-labelledby={titleId}>
      <ProjectThumbnail project={project} />
      <div className="project-card__body">
        <div className="project-card__meta">
          <span className={`badge badge--${project.category}`}>{t.category[project.category].singular}</span>
          {project.status ? (
            <span className={`badge badge--status badge--status-${project.status}`}>
              {t.projectStatus[project.status]}
            </span>
          ) : null}
        </div>
        <div className="project-card__heading">
          {project.logo ? (
            <img className="project-logo" src={project.logo} alt="" width={40} height={40} loading="lazy" />
          ) : null}
          <h2 id={titleId} className="project-card__title">
            {project.name}
          </h2>
        </div>
        <p className="project-card__summary">{project.summary}</p>
        {project.stack.length > 0 ? (
          <ul className="chip-list" aria-label={t.technologiesUsed}>
            {project.stack.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
        {hasActions ? (
          <div className="project-card__actions">
            {project.demoUrl ? (
              <a className="aero-button aero-button--primary" href={project.demoUrl} target="_blank" rel="noreferrer">
                {t.demo}
                <span className="sr-only">
                  {t.ofProject(project.name)}
                  {t.opensNewTab}
                </span>
              </a>
            ) : null}
            {project.repositoryUrl ? (
              <a className="aero-button" href={project.repositoryUrl} target="_blank" rel="noreferrer">
                {t.repository}
                <span className="sr-only">
                  {t.ofProject(project.name)}
                  {t.opensNewTab}
                </span>
              </a>
            ) : null}
            {project.details ? (
              <button
                type="button"
                className="aero-button"
                aria-haspopup="dialog"
                onClick={() => onShowDetails(project)}
              >
                {t.details}
                <span className="sr-only">{t.ofProject(project.name)}</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
