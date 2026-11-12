/** Ordem das categorias de projeto. Os nomes exibidos ficam em src/i18n/ui.ts. */
import type { ProjectCategory } from '../types/portfolio';
import { portfolio } from './portfolio';

export const CATEGORY_ORDER: readonly ProjectCategory[] = ['profissional', 'academico', 'pessoal'];

/** Categorias com ao menos um projeto: as vazias somem da navegação e dos atalhos. */
export const PROJECT_CATEGORIES: readonly ProjectCategory[] = CATEGORY_ORDER.filter((category) =>
  portfolio.projects.some((project) => project.category === category),
);
