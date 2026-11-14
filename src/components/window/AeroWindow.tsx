import type { ReactNode, Ref } from 'react';
import './window.css';

/** Aberta, minimizada (volta pela barra de tarefas) ou fechada (volta pelo ícone "Portfólio"). */
export type WindowState = 'open' | 'minimized' | 'closed';

interface AeroWindowProps {
  /** Barra de título (identidade + controles da janela). */
  readonly titleBar: ReactNode;
  readonly children: ReactNode;
  readonly state?: WindowState;
  readonly windowRef?: Ref<HTMLDivElement>;
}

/**
 * Moldura Aero do kit: desfoque → grupo de vidro (opacidade única) → contorno
 * escuro + aresta clara → cabeçalho → abertura de conteúdo. O conteúdo interno
 * pertence ao portfólio e segue o tema; a moldura não.
 * Sem papel ARIA próprio: a semântica vem dos marcos internos (banner, main...).
 * Minimizada ou fechada, fica `inert`: fora do Tab e dos leitores de tela.
 */
export function AeroWindow({ titleBar, children, state = 'open', windowRef }: AeroWindowProps) {
  return (
    <div ref={windowRef} className={`aero-window${state === 'open' ? '' : ` is-${state}`}`} inert={state !== 'open'}>
      {titleBar}
      <div className="aero-window__body">{children}</div>
    </div>
  );
}
