import { useI18n } from '../../i18n/I18n';
import type { Project } from '../../types/portfolio';
import { Icon } from '../ui/Icon';

/**
 * Miniatura do card. Com `project.thumbnail`, mostra a imagem real; sem ela,
 * desenha uma miniatura temporária no estilo Aero (cor e ícone da categoria; Diara e FoldAero têm cor própria em sections.css).
 */
export function ProjectThumbnail({ project }: { readonly project: Project }) {
  const { t } = useI18n();
  if (project.thumbnail) {
    return (
      <img
        className="project-thumb"
        src={project.thumbnail.src}
        alt={project.thumbnail.alt}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div
      className={`project-thumb project-thumb--placeholder project-thumb--${project.category} project-thumb--${project.id}`}
      role="img"
      aria-label={t.placeholderThumb(t.category[project.category].singular)}
    >
      <span className="project-thumb__icon">
        {project.logo ? (
          <img className="project-thumb__logo" src={project.logo} alt="" width={96} height={96} />
        ) : (
          <Icon name={project.category} size={56} />
        )}
      </span>
      <span className="project-thumb__sheen" aria-hidden="true" />
      <span className="project-thumb__note" aria-hidden="true">
        {t.placeholderNote}
      </span>
    </div>
  );
}
