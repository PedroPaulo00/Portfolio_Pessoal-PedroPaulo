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
}

export function WindowTitleBar({ profile, title, menuId, menuOpen, onOpenMenu, logoButtonRef }: WindowTitleBarProps) {
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
      <WindowControls />
    </header>
  );
}

/** Minimizar/maximizar/fechar: apenas visuais na V1 (fechar impediria a navegação). */
function WindowControls() {
  return (
    <div className="window-controls" aria-hidden="true">
      <span className="window-controls__item">−</span>
      <span className="window-controls__item">□</span>
      <span className="window-controls__item window-controls__item--close">×</span>
    </div>
  );
}
