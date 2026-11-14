import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../../i18n/I18n';
import { PROJECT_VIEWS, type ProjectView } from '../../lib/projectView';

interface ViewMenuProps {
  readonly value: ProjectView;
  readonly onChange: (view: ProjectView) => void;
}

/**
 * Botão "Visualizar" da barra de comandos, como o "Modo de exibição" do Explorer
 * do Windows 7: uma lista de modos e, à esquerda, o controle deslizante que
 * percorre os mesmos modos (a lista muda ao vivo enquanto ele é arrastado).
 * Teclado: setas, Home/End e Esc na lista; Tab sai do menu.
 */
export function ViewMenu({ value, onChange }: ViewMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const last = PROJECT_VIEWS.length - 1;

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const close = (event: Event) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('focusin', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('focusin', close);
    };
  }, [open]);

  const closeAndReturn = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const target: Record<string, number> = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in target) {
      event.preventDefault();
      items[target[event.key] ?? 0]?.focus();
    }
  };

  return (
    <div className="view-menu">
      <button
        ref={buttonRef}
        type="button"
        className="command-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={t.viewTitle}
        onClick={() => setOpen((current) => !current)}
      >
        <ViewGlyph view={value} />
        <span className="command-button__label">{t.view}</span>
        <span className="view-menu__caret" aria-hidden="true" />
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="view-menu__panel"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closeAndReturn();
            }
          }}
        >
          {/* Em cima = maior; valor invertido em relação à ordem da lista. */}
          <input
            className="view-menu__slider"
            type="range"
            min={0}
            max={last}
            step={1}
            value={last - PROJECT_VIEWS.indexOf(value)}
            aria-label={t.viewSlider}
            aria-valuetext={t.viewOptions[value]}
            onChange={(event) => onChange(PROJECT_VIEWS[last - Number(event.target.value)] ?? value)}
          />
          <div id={menuId} className="view-menu__list" role="menu" aria-label={t.viewTitle} onKeyDown={onListKeyDown}>
            {PROJECT_VIEWS.map((view) => (
              <button
                key={view}
                type="button"
                className="view-menu__item"
                role="menuitemradio"
                aria-checked={view === value}
                tabIndex={view === value ? 0 : -1}
                onClick={() => {
                  onChange(view);
                  closeAndReturn();
                }}
              >
                <ViewGlyph view={view} />
                {t.viewOptions[view]}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const BLUE = '#3f8fdc';
const LINE = '#7d8fa3';

/** Miniatura de cada modo (16 px): blocos azuis = ícones, traços = texto. */
function ViewGlyph({ view }: { readonly view: ProjectView }) {
  const square = (x: number, y: number, size: number) => (
    <rect key={`s${x}-${y}`} x={x} y={y} width={size} height={size} rx={size > 4 ? 1 : 0.5} fill={BLUE} />
  );
  const line = (x: number, y: number, width: number) => (
    <rect key={`l${x}-${y}`} x={x} y={y} width={width} height={1.4} fill={LINE} />
  );
  const shapes = {
    'extra-large': [square(2, 2, 12)],
    large: [square(1.5, 1.5, 5.5), square(9, 1.5, 5.5), square(1.5, 9, 5.5), square(9, 9, 5.5)],
    medium: [0, 1, 2].flatMap((row) => [0, 1, 2].map((column) => square(1.5 + column * 4.6, 1.5 + row * 4.6, 3.6))),
    small: [0, 1, 2].flatMap((row) => [
      square(1, 2 + row * 4.5, 2.6),
      line(4.4, 2.6 + row * 4.5, 3),
      square(8.6, 2 + row * 4.5, 2.6),
      line(12, 2.6 + row * 4.5, 3),
    ]),
    list: [0, 1, 2, 3].flatMap((row) => [square(1.5, 1.4 + row * 3.6, 2.4), line(5, 1.9 + row * 3.6, 9.5)]),
    details: [
      <rect key="head" x={1} y={1.5} width={14} height={2.6} fill={BLUE} />,
      ...[0, 1, 2].flatMap((row) => [
        line(1, 6 + row * 3.2, 5),
        line(7, 6 + row * 3.2, 3.5),
        line(11.5, 6 + row * 3.2, 3.5),
      ]),
    ],
    tiles: [0, 1].flatMap((row) => [
      square(1.5, 1.5 + row * 7.5, 5.5),
      line(8.5, 2.6 + row * 7.5, 6),
      line(8.5, 5 + row * 7.5, 4.4),
    ]),
    content: [0, 1].flatMap((row) => [
      square(1.5, 1.5 + row * 7.5, 5),
      line(8, 2.2 + row * 7.5, 7),
      line(8, 4.6 + row * 7.5, 7),
      <rect key={`d${row}`} x={1} y={7.6 + row * 7.5} width={14} height={0.6} fill={LINE} opacity={0.6} />,
    ]),
  } satisfies Record<ProjectView, unknown>;

  return (
    <svg className="view-glyph" width={16} height={16} viewBox="0 0 16 16" aria-hidden="true">
      {shapes[view]}
    </svg>
  );
}
