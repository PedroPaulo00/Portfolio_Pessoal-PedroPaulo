import type { ReactNode } from 'react';

interface SectionHeaderProps {
  readonly title: string;
  readonly description?: ReactNode;
}

/**
 * Título da vista atual. Recebe o foco após cada navegação (tabIndex -1), para
 * leitores de tela anunciarem o novo destino.
 */
export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <h1 className="section-header__title" tabIndex={-1} data-view-heading>
        {title}
      </h1>
      {description ? <p className="section-header__description">{description}</p> : null}
    </header>
  );
}
