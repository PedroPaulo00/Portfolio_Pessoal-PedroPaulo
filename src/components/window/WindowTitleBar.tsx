import { useEffect, useState, type Ref } from 'react';
import { useI18n } from '../../i18n/I18n';
import { unlockAchievement } from '../../lib/achievements';
import { hopElement } from '../../lib/eggs';
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
      <WindowControls
        onMinimize={onMinimize}
        onClose={onClose}
        minimizeLabel={t.minimize}
        closeLabel={t.closeWindow}
        maximizeTip={t.maximizeTip}
      />
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
  maximizeTip,
}: {
  readonly onMinimize: () => void;
  readonly onClose: () => void;
  readonly minimizeLabel: string;
  readonly closeLabel: string;
  readonly maximizeTip: string;
}) {
  const [tip, setTip] = useState(false);
  useEffect(() => {
    if (!tip) return;
    const timer = window.setTimeout(() => setTip(false), 2600);
    return () => window.clearTimeout(timer);
  }, [tip]);
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
      <button
        type="button"
        className="window-controls__item window-controls__item--button"
        tabIndex={-1}
        title={maximizeTip}
        onClick={(event) => {
          // Easter egg: a janela "tenta" crescer, dá um pulinho e avisa que já é perfeita.
          hopElement(event.currentTarget.closest('.aero-window'));
          setTip(true);
          unlockAchievement('maximize');
        }}
      >
        □
      </button>
      {tip ? (
        <span className="window-controls__tip" role="status">
          {maximizeTip}
        </span>
      ) : null}
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
