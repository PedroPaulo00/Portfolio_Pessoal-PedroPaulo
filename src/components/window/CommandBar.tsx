import type { ReactNode } from 'react';

interface CommandBarProps {
  readonly label: string;
  /** Ações contextuais da seção atual (somente ações reais). */
  readonly children?: ReactNode;
  /** Ações globais, alinhadas à direita. */
  readonly trailing?: ReactNode;
}

/** Barra de comandos clara do Explorer (kit 7F, passo 2). */
export function CommandBar({ label, children, trailing }: CommandBarProps) {
  return (
    <div className="command-bar" role="toolbar" aria-label={label}>
      <div className="command-bar__group">{children}</div>
      {trailing ? <div className="command-bar__group command-bar__group--end">{trailing}</div> : null}
    </div>
  );
}
