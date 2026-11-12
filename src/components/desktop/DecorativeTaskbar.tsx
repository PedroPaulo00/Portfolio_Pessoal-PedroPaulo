import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { Profile } from '../../types/portfolio';
import { BrandMark } from '../ui/BrandMark';
import { TaskbarClock } from './TaskbarClock';
import './desktop.css';

interface DecorativeTaskbarProps {
  readonly profile: Profile;
  /** Botão Iniciar: abre o menu do portfólio. */
  readonly startButton: ReactNode;
  /** Controle de volume do som de fundo (bandeja). */
  readonly volumeControl: ReactNode;
  /** Indicador de idioma (PT/EN), como o da barra de idiomas do Windows 7. */
  readonly languageControl: ReactNode;
}

/**
 * Barra de tarefas. Funcionais: botão Iniciar, volume e relógio. Decorativos
 * (aria-hidden, sem cursor de clique, sem foco): botão da janela, ícones de
 * bandeja e "mostrar área de trabalho".
 */
export function DecorativeTaskbar({ profile, startButton, volumeControl, languageControl }: DecorativeTaskbarProps) {
  const { t } = useI18n();
  return (
    <div className="taskbar" role="region" aria-label={t.taskbar}>
      <div className="taskbar__glass" aria-hidden="true" />
      <div className="taskbar__start">{startButton}</div>
      <div className="taskbar__items" aria-hidden="true">
        <span className="taskbar__item taskbar__item--active">
          <BrandMark profile={profile} size={24} />
          <span className="taskbar__item-label">{t.windowTitle(profile.name)}</span>
        </span>
      </div>
      <div className="taskbar__tray">
        <span className="taskbar__tray-decor" aria-hidden="true">
          <span className="taskbar__tray-chevron" />
          <span className="taskbar__tray-bars">
            <i />
            <i />
            <i />
            <i />
          </span>
        </span>
        {languageControl}
        {volumeControl}
        <TaskbarClock />
      </div>
      <span className="taskbar__peek" aria-hidden="true" />
    </div>
  );
}
