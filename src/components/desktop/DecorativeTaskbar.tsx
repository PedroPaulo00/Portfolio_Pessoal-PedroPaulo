import type { PointerEvent, ReactNode, Ref } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { Profile, Section } from '../../types/portfolio';
import { BrandMark } from '../ui/BrandMark';
import { Icon } from '../ui/Icon';
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
  /** Seção aberta na janela (aparece na miniatura do botão da janela). */
  readonly section: Section;
  /** Janela minimizada: some da área de trabalho até clicar de novo no botão. */
  readonly minimized: boolean;
  readonly onToggleWindow: () => void;
  /** Botão da janela: a animação de minimizar encolhe em direção a ele. */
  readonly windowButtonRef: Ref<HTMLButtonElement>;
  /** Link de configurações do painel de data e hora (aberto pelo relógio). */
  readonly onOpenDateSettings: (opener: HTMLElement | null) => void;
}

/**
 * Barra de tarefas. Funcionais: botão Iniciar, botão da janela (minimiza e
 * restaura), idioma, volume e relógio (abre o calendário). Decorativos (aria-hidden, sem foco):
 * ícones de bandeja e "mostrar área de trabalho".
 */
export function DecorativeTaskbar({
  profile,
  startButton,
  volumeControl,
  languageControl,
  section,
  minimized,
  onToggleWindow,
  windowButtonRef,
  onOpenDateSettings,
}: DecorativeTaskbarProps) {
  const { t } = useI18n();
  const title = t.windowTitle(profile.name);

  // Brilho que acompanha o ponteiro sobre o botão, como no Windows 7.
  const trackGlow = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--glow-x', `${Math.round(event.clientX - box.left)}px`);
  };

  return (
    <div className="taskbar" role="region" aria-label={t.taskbar}>
      <div className="taskbar__glass" aria-hidden="true" />
      <div className="taskbar__start">{startButton}</div>
      <div className="taskbar__items">
        <div className="taskbar__task">
          <button
            ref={windowButtonRef}
            type="button"
            className={`taskbar__item ${minimized ? 'is-minimized' : 'is-active'}`}
            aria-label={minimized ? t.restoreWindow(title) : t.minimizeWindow(title)}
            onClick={onToggleWindow}
            onPointerMove={trackGlow}
          >
            <BrandMark profile={profile} size={24} />
            <span className="taskbar__item-label">{title}</span>
          </button>
          {/* Leitores de tela: avisa que o conteúdo saiu de cena e como voltar. */}
          <span className="sr-only" role="status">
            {minimized ? t.windowMinimized : ''}
          </span>
          {/* Miniatura ao passar o mouse (Aero Peek): só visual, um esboço da janela. */}
          <div className="taskbar-preview" aria-hidden="true">
            <div className="taskbar-preview__title">
              <BrandMark profile={profile} size={16} />
              <span>{title}</span>
            </div>
            <div className="taskbar-preview__thumb">
              <span className="taskbar-preview__bar">
                <i />
                <i />
                <i />
              </span>
              <span className="taskbar-preview__tools" />
              <span className="taskbar-preview__body">
                <span className="taskbar-preview__nav">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="taskbar-preview__view">
                  <Icon name={section.id} size={26} />
                  <span className="taskbar-preview__section">{section.label}</span>
                  <i />
                  <i />
                </span>
              </span>
            </div>
          </div>
        </div>
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
        <TaskbarClock onOpenSettings={onOpenDateSettings} />
      </div>
      <span className="taskbar__peek" aria-hidden="true" />
    </div>
  );
}
