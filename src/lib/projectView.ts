/**
 * Modo de exibição da lista de projetos, como o "Modo de exibição" do Explorer
 * do Windows 7. A escolha fica salva no navegador.
 */

/** Na ordem do menu do Windows 7 (do maior para o mais compacto). */
export const PROJECT_VIEWS = [
  'extra-large',
  'large',
  'medium',
  'small',
  'list',
  'details',
  'tiles',
  'content',
] as const;

export type ProjectView = (typeof PROJECT_VIEWS)[number];

/** O padrão é o cartão completo de sempre ("Ícones grandes"). */
export const DEFAULT_PROJECT_VIEW: ProjectView = 'large';

const VIEW_KEY = 'portfolio-aero:project-view';

export function getProjectView(): ProjectView {
  try {
    const stored = localStorage.getItem(VIEW_KEY);
    return PROJECT_VIEWS.find((view) => view === stored) ?? DEFAULT_PROJECT_VIEW;
  } catch {
    return DEFAULT_PROJECT_VIEW;
  }
}

export function saveProjectView(view: ProjectView): void {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
}
