import { PROJECT_CATEGORIES } from '../../data/labels';
import { useI18n } from '../../i18n/I18n';
import { RouteLink, useNavigation } from '../../lib/navigation';
import type { Section } from '../../types/portfolio';
import { Icon } from '../ui/Icon';

interface PortfolioNavigationProps {
  readonly sections: readonly Section[];
}

/**
 * Painel esquerdo no estilo Explorer: grupo de seções e, abaixo, as categorias
 * de projeto como subitens (destinos reais: #projetos/<categoria>).
 */
export function PortfolioNavigation({ sections }: PortfolioNavigationProps) {
  const { route } = useNavigation();
  const { t } = useI18n();

  return (
    <nav className="side-nav" aria-label={t.portfolioSections}>
      <ul className="side-nav__list">
        {sections.map((section) => (
          <li key={section.id}>
            <RouteLink
              to={{ section: section.id }}
              markCurrent
              className={`side-nav__link${route.section === section.id && !route.category ? ' is-selected' : ''}`}
            >
              <Icon name={section.id} size={20} />
              <span>{section.label}</span>
            </RouteLink>

            {section.id === 'projetos' ? (
              <ul className="side-nav__list side-nav__list--nested" aria-label={t.projectCategories}>
                {PROJECT_CATEGORIES.map((category) => (
                  <li key={category}>
                    <RouteLink
                      to={{ section: 'projetos', category }}
                      markCurrent
                      className={`side-nav__link side-nav__link--nested${route.category === category ? ' is-selected' : ''}`}
                    >
                      <Icon name={category} size={18} />
                      <span>{t.category[category].plural}</span>
                    </RouteLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
