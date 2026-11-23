import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
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
  /**
   * Janela (false): não bloqueia o resto da tela, fica na barra de tarefas e
   * pode ser minimizada. Padrão: modal (bloqueia, como os detalhes de projeto).
   */
  readonly modal?: boolean;
  /** Só janelas: minimizada (some, e volta pela barra de tarefas). */
  readonly minimized?: boolean;
  /** Só janelas: mostra o botão "−" na barra de título. */
  readonly onMinimize?: () => void;
  /** Só janelas: clicou ou focou nela (vem para a frente). */
  readonly onActivate?: () => void;
  readonly style?: CSSProperties;
  /** Só janelas: o id da tarefa na barra (o Flip 3D usa para achar a janela). */
  readonly windowId?: string;
}

/**
 * Diálogo como uma pequena janela Aero: mesma moldura protegida da janela
 * principal; aqui o botão fechar é REAL (vermelho do kit, com hover). Esc, clique
 * fora e os botões fecham; o <dialog> nativo devolve o foco a quem o abriu.
 * O conteúdo rola; a faixa de botões fica fixa no rodapé, como no Windows 7.
 */
export function AeroDialog({
  open,
  title,
  onClose,
  children,
  actions,
  wide = false,
  modal = true,
  minimized = false,
  onMinimize,
  onActivate,
  style,
  windowId,
}: AeroDialogProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (modal) dialog.showModal();
      else dialog.show();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, modal]);

  return (
    <dialog
      ref={ref}
      className={`aero-dialog${wide ? ' aero-dialog--wide' : ''}${modal ? '' : ' aero-dialog--window'}${minimized ? ' is-minimized' : ''}`}
      style={style}
      data-window={windowId}
      aria-labelledby={titleId}
      inert={minimized}
      onClose={onClose}
      onClick={(event) => {
        if (modal && event.target === event.currentTarget) event.currentTarget.close();
      }}
      onPointerDown={modal ? undefined : onActivate}
      onFocus={modal ? undefined : onActivate}
      onKeyDown={(event) => {
        // Janela (não modal): o navegador não fecha com Esc sozinho.
        if (!modal && event.key === 'Escape') {
          event.stopPropagation();
          ref.current?.close();
        }
      }}
    >
      <div className="aero-window aero-window--dialog">
        <header className="aero-titlebar" role="presentation">
          <h2 id={titleId} className="aero-titlebar__title aero-dialog__title">
            {title}
          </h2>
          {onMinimize ? (
            <button
              type="button"
              className="dialog-minimize"
              aria-label={t.minimizeWindow(title)}
              title={t.minimizeWindow(title)}
              onClick={onMinimize}
            >
              <span aria-hidden="true" />
            </button>
          ) : null}
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
