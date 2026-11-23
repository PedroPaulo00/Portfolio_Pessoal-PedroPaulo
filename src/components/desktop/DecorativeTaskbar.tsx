import { useEffect, useRef, type PointerEvent, type ReactNode, type Ref } from 'react';
import flipIcon from '../../assets/desktop/flip3d.png';
import { useI18n } from '../../i18n/I18n';
import { openFlip3D } from '../../lib/flip3d';
import { useTasks } from '../../lib/tasks';
import type { Profile, Section } from '../../types/portfolio';
import type { WindowState } from '../window/AeroWindow';
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
  /** Minimizada: o botão da janela a restaura. Fechada: o botão some da barra. */
  readonly windowState: WindowState;
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
  windowState,
  onToggleWindow,
  windowButtonRef,
  onOpenDateSettings,
}: DecorativeTaskbarProps) {
  const { t } = useI18n();
  // Nome da janela (o mesmo da barra de título); a aba do navegador mantém o nome completo.
  const title = t.portfolioShortcut;
  const minimized = windowState === 'minimized';
  // Janelas e personagens abertos pelos ícones da área de trabalho.
  const tasks = useTasks();
  // Celular (fileira que desliza): uma tarefa nova fica à vista na barra.
  const itemsRef = useRef<HTMLDivElement>(null);
  const taskCount = tasks.length;
  const lastCount = useRef(taskCount);
  useEffect(() => {
    const items = itemsRef.current;
    if (items && taskCount > lastCount.current) items.scrollTo({ left: items.scrollWidth });
    lastCount.current = taskCount;
  }, [taskCount]);

  // Roda do mouse sobre a barra (computador): abre o Flip 3D, como no Windows 7.
  // Ouvinte nativo (não passivo): a página por trás não rola junto.
  const taskbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = taskbarRef.current;
    if (!bar) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0 || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      if ((event.target as HTMLElement).closest('.volume, .datetime')) return;
      event.preventDefault();
      openFlip3D();
    };
    bar.addEventListener('wheel', onWheel, { passive: false });
    return () => bar.removeEventListener('wheel', onWheel);
  }, []);

  // Brilho que acompanha o ponteiro sobre o botão, como no Windows 7.
  const trackGlow = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--glow-x', `${Math.round(event.clientX - box.left)}px`);
  };

  return (
    <div ref={taskbarRef} className="taskbar" role="region" aria-label={t.taskbar}>
      <div className="taskbar__glass" aria-hidden="true" />
      <div className="taskbar__start">{startButton}</div>
      <button
        type="button"
        className="taskbar__flip"
        aria-label={t.flip3d.open}
        title={t.flip3d.open}
        onClick={openFlip3D}
      >
        <img src={flipIcon} alt="" width={26} height={26} draggable={false} />
      </button>
      <div ref={itemsRef} className="taskbar__items">
        {/* Leitores de tela: avisa que o conteúdo saiu de cena e como voltar. */}
        <span className="sr-only" role="status">
          {minimized ? t.windowMinimized : ''}
          {windowState === 'closed' ? t.windowClosed : ''}
        </span>
        <div className="taskbar__task" hidden={windowState === 'closed'}>
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
        {tasks.map((task) => (
          <div className="taskbar__task" key={task.id}>
            <button
              type="button"
              data-task={task.id}
              className={`taskbar__item taskbar__item--app ${task.minimized ? 'is-minimized' : 'is-active'}`}
              aria-label={task.minimized ? t.restoreWindow(task.label) : t.minimizeWindow(task.label)}
              title={task.label}
              onClick={task.toggle}
              onPointerMove={trackGlow}
            >
              {task.image ? (
                <img className="taskbar__item-icon" src={task.image} alt="" width={24} height={24} draggable={false} />
              ) : null}
              <span className="taskbar__item-label">{task.label}</span>
            </button>
          </div>
        ))}
      </div>
      {/* O idioma (PT/EN) fica fora da bandeja segmentada: logo antes do risco que a delimita. */}
      <div className="taskbar__language">{languageControl}</div>
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
        {volumeControl}
        <TaskbarClock onOpenSettings={onOpenDateSettings} />
      </div>
      <span className="taskbar__peek" aria-hidden="true" />
    </div>
  );
}
