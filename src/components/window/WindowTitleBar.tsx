import type { Ref } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { Profile } from '../../types/portfolio';
import { BrandMark, menuButtonLabel } from '../ui/BrandMark';

interface WindowTitleBarProps {
  readonly profile: Profile;
  readonly title: string;
  readonly menuId: string;
  readonly menuOpen: boolean;
  readonly onOpenMenu: () => void;
  readonly logoButtonRef: Ref<HTMLButtonElement>;
  /** Botão "−": minimiza a janela (mesma ação do botão dela na barra de tarefas). */
  readonly onMinimize: () => void;
  /** Botão "×": fecha a janela (ela volta pelo ícone "Portfólio" da área de trabalho). */
  readonly onClose: () => void;
}

export function WindowTitleBar({
  profile,
  title,
  menuId,
  menuOpen,
  onOpenMenu,
  logoButtonRef,
  onMinimize,
  onClose,
}: WindowTitleBarProps) {
  const { t } = useI18n();
  return (
    // Banner: identidade do site (logo + nome).
    <header className="aero-titlebar">
      <div className="aero-titlebar__identity">
        <button
          ref={logoButtonRef}
          type="button"
          className="title-logo-button"
          aria-label={menuButtonLabel(profile, t)}
          aria-haspopup="dialog"
          aria-controls={menuId}
          aria-expanded={menuOpen}
          title={t.menuTitle(profile.name)}
          onClick={onOpenMenu}
        >
          <BrandMark profile={profile} size={22} />
        </button>
        <p className="aero-titlebar__title" title={title}>
          {title}
        </p>
      </div>
      <WindowControls onMinimize={onMinimize} onClose={onClose} minimizeLabel={t.minimize} closeLabel={t.closeWindow} />
    </header>
  );
}

/**
 * Minimizar e fechar funcionam com o mouse; maximizar é só visual. O grupo fica
 * fora do Tab e dos leitores de tela (aria-hidden + tabIndex -1): pelo teclado,
 * minimiza-se e restaura-se pelo botão da janela na barra de tarefas, e nada do
 * conteúdo depende de fechar a janela. Ao minimizar ou fechar, o foco vai para o
 * controle que traz a janela de volta.
 */
function WindowControls({
  onMinimize,
  onClose,
  minimizeLabel,
  closeLabel,
}: {
  readonly onMinimize: () => void;
  readonly onClose: () => void;
  readonly minimizeLabel: string;
  readonly closeLabel: string;
}) {
  return (
    <div className="window-controls" aria-hidden="true">
      <button
        type="button"
        className="window-controls__item window-controls__item--button"
        tabIndex={-1}
        title={minimizeLabel}
        onClick={onMinimize}
      >
        −
      </button>
      <span className="window-controls__item">□</span>
      <button
        type="button"
        className="window-controls__item window-controls__item--button window-controls__item--close"
        tabIndex={-1}
        title={closeLabel}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
