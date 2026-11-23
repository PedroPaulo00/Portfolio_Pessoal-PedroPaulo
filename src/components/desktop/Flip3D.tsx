import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../../i18n/I18n';
import { closeFlip3D } from '../../lib/flip3d';
import { getTasks } from '../../lib/tasks';
import './flip3d.css';

interface Item {
  readonly key: string;
  readonly title: string;
  readonly source: HTMLElement;
  /** Envolve a cópia (as janelas de diálogo dependem da classe do <dialog> em volta). */
  readonly shell?: string;
  readonly width: number;
  readonly height: number;
  /** Quanto da janela (rolada) fica acima da tela: a cópia mostra a parte visível. */
  readonly scrollTop: number;
  readonly select: () => void;
}

/** Restaura (se minimizada) uma tarefa da barra e a traz para a frente. */
function activateTask(id: string, element: HTMLElement, pointer: boolean) {
  const task = getTasks().find((item) => item.id === id);
  if (task?.minimized) task.toggle();
  // Os mesmos eventos que a janela ouve ao ser clicada (o botão direito não inicia arrasto).
  if (pointer) element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }));
  else element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
}

/** Janelas abertas agora: o portfólio, as janelas dos ícones e o Media Player. */
function collect(portfolioTitle: string, playerTitle: string, onPortfolio: () => void): Item[] {
  const items: Item[] = [];
  const frame = document.querySelector<HTMLElement>('.desktop-stage > .aero-window');
  if (frame && !frame.classList.contains('is-closed')) {
    items.push({
      key: 'portfolio',
      title: portfolioTitle,
      source: frame,
      width: frame.offsetWidth,
      height: Math.min(frame.offsetHeight, window.innerHeight - 60),
      scrollTop: Math.max(0, -frame.getBoundingClientRect().top),
      select: onPortfolio,
    });
  }
  document.querySelectorAll<HTMLDialogElement>('dialog.aero-dialog--window[open][data-window]').forEach((dialog) => {
    const inner = dialog.querySelector<HTMLElement>(':scope > .aero-window');
    const key = dialog.dataset.window;
    if (!inner || !key) return;
    items.push({
      key,
      title: dialog.querySelector('.aero-titlebar__title')?.textContent ?? '',
      source: inner,
      shell: dialog.className,
      width: inner.offsetWidth,
      height: inner.offsetHeight,
      scrollTop: 0,
      select: () => activateTask(key, dialog, false),
    });
  });
  const skin = document.querySelector<HTMLElement>('.wmp__skin');
  if (skin) {
    items.push({
      key: 'media-player',
      title: playerTitle,
      source: skin,
      shell: 'wmp',
      width: skin.offsetWidth,
      height: skin.offsetHeight,
      scrollTop: 0,
      select: () => activateTask('media-player', skin, true),
    });
  }
  return items;
}

/** Cópia "morta" da janela para a pilha: sem ids, vídeos, iframes nem foco. */
function snapshot(item: Item): HTMLElement {
  const clone = item.source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  clone.querySelectorAll('video').forEach((video) => {
    video.removeAttribute('autoplay');
    video.autoplay = false;
    video.preload = 'none';
  });
  clone.querySelectorAll('iframe').forEach((frame) => frame.remove());
  clone.classList.add('flip3d__clone');
  clone.setAttribute('inert', '');
  if (item.scrollTop > 0) clone.style.marginTop = `${-item.scrollTop}px`;
  if (!item.shell) return clone;
  const shell = document.createElement('div');
  shell.className = `${item.shell} flip3d__shell`;
  shell.appendChild(clone);
  return shell;
}

interface Flip3DProps {
  /** Restaura a janela do portfólio (se minimizada). */
  readonly onPortfolio: () => void;
}

/**
 * Flip 3D do Windows Vista/7: as janelas abertas empilhadas em perspectiva sobre a
 * área de trabalho escurecida. Roda do mouse, setas ou Tab trocam a janela da
 * frente; Enter (ou clicar numa janela) a abre; Esc ou clicar fora fecham.
 */
export default function Flip3D({ onPortfolio }: Flip3DProps) {
  const { t } = useI18n();
  const [items] = useState(() => collect(t.portfolioShortcut, t.mediaPlayer.title, onPortfolio));
  // Ordem atual: o primeiro índice é a janela da frente.
  const [order, setOrder] = useState(() => items.map((_, index) => index));
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastWheel = useRef(0);
  const opener = useRef<Element | null>(document.activeElement);

  const step = (direction: 1 | -1) =>
    setOrder((current) =>
      current.length < 2
        ? current
        : direction === 1
          ? [...current.slice(1), current[0]!]
          : [current[current.length - 1]!, ...current.slice(0, -1)],
    );
  const choose = (index: number) => {
    closeFlip3D();
    items[index]?.select();
  };

  // Coloca a cópia de cada janela dentro do seu cartão.
  useLayoutEffect(() => {
    items.forEach((item, index) => {
      const holder = cardRefs.current[index];
      if (holder && !holder.firstChild) holder.appendChild(snapshot(item));
    });
  }, [items]);

  // Roda do mouse troca a janela da frente; ouvinte nativo (não passivo) para a
  // página por trás não rolar junto.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheel.current < 160 || event.deltaY === 0) return;
      lastWheel.current = now;
      step(event.deltaY > 0 ? 1 : -1);
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
    const previous = opener.current;
    return () => {
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, []);

  const layout = useMemo(() => {
    const n = order.length;
    return order.map((itemIndex, position) => {
      const item = items[itemIndex]!;
      const scale = Math.min(1, (window.innerWidth * 0.5) / item.width, (window.innerHeight * 0.55) / item.height);
      // A pilha sobe em diagonal para o fundo, centralizada na tela.
      const shift = position - (n - 1) / 2;
      const style = {
        width: item.width,
        height: item.height,
        zIndex: n - position,
        transform: `translate(-50%, -50%) translate3d(${shift * 70}px, ${-shift * 46}px, ${-position * 190}px) rotateY(-32deg) scale(${scale})`,
        opacity: position > 5 ? 0 : 1,
      } as CSSProperties;
      return { itemIndex, position, style };
    });
  }, [order, items]);

  const front = order[0];

  return (
    <div
      ref={rootRef}
      className="flip3d"
      role="dialog"
      aria-modal="true"
      aria-label={t.flip3d.label}
      tabIndex={-1}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeFlip3D();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeFlip3D();
        } else if (
          event.key === 'ArrowDown' ||
          event.key === 'ArrowRight' ||
          (event.key === 'Tab' && !event.shiftKey)
        ) {
          event.preventDefault();
          step(1);
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
          event.preventDefault();
          step(-1);
        } else if ((event.key === 'Enter' || event.key === ' ') && front !== undefined) {
          event.preventDefault();
          choose(front);
        }
      }}
    >
      <div className="flip3d__stage" onClick={(event) => event.target === event.currentTarget && closeFlip3D()}>
        {layout.map(({ itemIndex, position, style }) => (
          <button
            key={items[itemIndex]!.key}
            type="button"
            className={`flip3d__card${position === 0 ? ' is-front' : ''}`}
            style={style}
            tabIndex={position === 0 ? 0 : -1}
            data-title={items[itemIndex]!.title}
            onClick={() => choose(itemIndex)}
          >
            <span className="sr-only">{items[itemIndex]!.title}</span>
            <span
              className="flip3d__window"
              aria-hidden="true"
              ref={(node) => {
                cardRefs.current[itemIndex] = node;
              }}
            />
          </button>
        ))}
      </div>
      <p className="flip3d__hint">
        {items.length === 0
          ? t.flip3d.empty
          : items[front ?? 0]
            ? `${items[front ?? 0]!.title} · ${t.flip3d.hint}`
            : ''}
      </p>
    </div>
  );
}
