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
}

export function WindowTitleBar({
  profile,
  title,
  menuId,
  menuOpen,
  onOpenMenu,
  logoButtonRef,
  onMinimize,
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
      <WindowControls onMinimize={onMinimize} minimizeLabel={t.minimize} />
    </header>
  );
}

/**
 * Minimizar funciona com o mouse; maximizar e fechar são só visuais (fechar
 * impediria a navegação). O grupo fica fora do Tab e dos leitores de tela
 * (aria-hidden + tabIndex -1): o caminho acessível para minimizar e restaurar é
 * o botão da janela na barra de tarefas, que recebe o foco em seguida.
 */
function WindowControls({
  onMinimize,
  minimizeLabel,
}: {
  readonly onMinimize: () => void;
  readonly minimizeLabel: string;
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
      <span className="window-controls__item window-controls__item--close">×</span>
    </div>
  );
}
