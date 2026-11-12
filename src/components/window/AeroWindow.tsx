import type { ReactNode } from 'react';
import './window.css';

interface AeroWindowProps {
  /** Barra de título (identidade + controles decorativos). */
  readonly titleBar: ReactNode;
  readonly children: ReactNode;
}

/**
 * Moldura Aero do kit: desfoque → grupo de vidro (opacidade única) → contorno
 * escuro + aresta clara → cabeçalho → abertura de conteúdo. O conteúdo interno
 * pertence ao portfólio e segue o tema; a moldura não.
 * Sem papel ARIA próprio: a semântica vem dos marcos internos (banner, main...).
 */
export function AeroWindow({ titleBar, children }: AeroWindowProps) {
  return (
    <div className="aero-window">
      {titleBar}
      <div className="aero-window__body">{children}</div>
    </div>
  );
}
