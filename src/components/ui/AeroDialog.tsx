import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useI18n } from '../../i18n/I18n';
import '../window/window.css';

interface AeroDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  /** Botões extras do rodapé, antes do "Fechar". */
  readonly actions?: ReactNode;
  /** Diálogo mais largo, com o conteúdo de borda a borda (ex.: detalhes de projeto). */
  readonly wide?: boolean;
}

/**
 * Diálogo como uma pequena janela Aero: mesma moldura protegida da janela
 * principal; aqui o botão fechar é REAL (vermelho do kit, com hover). Esc, clique
 * fora e os botões fecham; o <dialog> nativo devolve o foco a quem o abriu.
 * O conteúdo rola; a faixa de botões fica fixa no rodapé, como no Windows 7.
 */
export function AeroDialog({ open, title, onClose, children, actions, wide = false }: AeroDialogProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`aero-dialog${wide ? ' aero-dialog--wide' : ''}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="aero-window aero-window--dialog">
        <header className="aero-titlebar">
          <h2 id={titleId} className="aero-titlebar__title aero-dialog__title">
            {title}
          </h2>
          <button type="button" className="dialog-close" aria-label={t.close} onClick={() => ref.current?.close()}>
            ×
          </button>
        </header>
        <div className="aero-window__body aero-dialog__body">
          <div className="aero-dialog__content">{children}</div>
          <div className="aero-dialog__actions">
            {actions}
            <button type="button" className="aero-button" onClick={() => ref.current?.close()}>
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
