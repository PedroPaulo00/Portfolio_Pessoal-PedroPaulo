import type { ReactNode, Ref } from 'react';
import './window.css';

interface AeroWindowProps {
  /** Barra de título (identidade + controles decorativos). */
  readonly titleBar: ReactNode;
  readonly children: ReactNode;
  /** Minimizada pela barra de tarefas: encolhe até o botão e some (app.css). */
  readonly minimized?: boolean;
  readonly windowRef?: Ref<HTMLDivElement>;
}

/**
 * Moldura Aero do kit: desfoque → grupo de vidro (opacidade única) → contorno
 * escuro + aresta clara → cabeçalho → abertura de conteúdo. O conteúdo interno
 * pertence ao portfólio e segue o tema; a moldura não.
 * Sem papel ARIA próprio: a semântica vem dos marcos internos (banner, main...).
 * Minimizada, fica `inert`: fora do Tab e dos leitores de tela até ser restaurada.
 */
export function AeroWindow({ titleBar, children, minimized = false, windowRef }: AeroWindowProps) {
  return (
    <div ref={windowRef} className={`aero-window${minimized ? ' is-minimized' : ''}`} inert={minimized}>
      {titleBar}
      <div className="aero-window__body">{children}</div>
    </div>
  );
}
