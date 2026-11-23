/**
 * Arrastar a janela do portfólio pela barra de título (só no computador, com
 * mouse) e o Aero Shake do Windows 7: chacoalhar a janela enquanto a arrasta
 * minimiza todas as outras; chacoalhar de novo traz de volta as que sumiram.
 * Clique duplo na barra de título devolve a janela ao centro.
 */
import { useEffect, type RefObject } from 'react';
import { unlockAchievement } from './achievements';
import { getTasks } from './tasks';

/** Computador com mouse e tela larga o bastante para a janela não ocupar tudo. */
const DESKTOP = '(hover: hover) and (pointer: fine) and (min-width: 64em)';
/** Viradas de direção (com pelo menos MIN_SWING px cada) dentro de WINDOW_MS para valer como chacoalhar. */
const SWINGS = 4;
const MIN_SWING = 28;
const WINDOW_MS = 1000;
/** Quanto da janela precisa continuar à vista nas laterais. */
const KEEP_VISIBLE = 140;

/** Tarefas que o último Aero Shake minimizou (o próximo as traz de volta). */
let shaken: string[] = [];

function aeroShake(): void {
  unlockAchievement('aeroshake');
  const tasks = getTasks();
  const visible = tasks.filter((task) => !task.minimized);
  if (visible.length > 0) {
    shaken = visible.map((task) => task.id);
    visible.forEach((task) => task.toggle());
    return;
  }
  tasks.filter((task) => task.minimized && shaken.includes(task.id)).forEach((task) => task.toggle());
  shaken = [];
}

export function useWindowDrag(windowRef: RefObject<HTMLDivElement | null>, enabled: boolean): void {
  useEffect(() => {
    const frame = windowRef.current;
    const bar = frame?.querySelector<HTMLElement>('.aero-titlebar');
    if (!frame || !bar || !enabled) return;
    const media = window.matchMedia(DESKTOP);

    const setOffset = (x: number, y: number) => {
      frame.style.setProperty('--drag-x', `${Math.round(x)}px`);
      frame.style.setProperty('--drag-y', `${Math.round(y)}px`);
    };
    const reset = () => {
      frame.style.removeProperty('--drag-x');
      frame.style.removeProperty('--drag-y');
    };
    const offset = () => ({
      x: parseFloat(frame.style.getPropertyValue('--drag-x')) || 0,
      y: parseFloat(frame.style.getPropertyValue('--drag-y')) || 0,
    });

    let drag: {
      id: number;
      px: number;
      py: number;
      ox: number;
      oy: number;
      box: DOMRect;
      dir: number;
      turnX: number;
      swings: number[];
    } | null = null;

    const onDown = (event: PointerEvent) => {
      if (!media.matches || event.button !== 0) return;
      // Botões da barra (logo, minimizar, maximizar, fechar) continuam sendo botões.
      if ((event.target as HTMLElement).closest('button, a, input')) return;
      const { x, y } = offset();
      drag = {
        id: event.pointerId,
        px: event.clientX,
        py: event.clientY,
        ox: x,
        oy: y,
        box: frame.getBoundingClientRect(),
        dir: 0,
        turnX: event.clientX,
        swings: [],
      };
      bar.setPointerCapture(event.pointerId);
      frame.classList.add('is-dragging');
      event.preventDefault();
    };

    const onMove = (event: PointerEvent) => {
      const d = drag;
      if (!d || event.pointerId !== d.id) return;
      const dx = event.clientX - d.px;
      const dy = event.clientY - d.py;
      // Limites: a barra de título nunca sai pelo alto nem some atrás da barra de tarefas.
      const taskbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height')) || 40;
      const minX = -d.box.left - d.box.width + KEEP_VISIBLE;
      const maxX = window.innerWidth - d.box.left - KEEP_VISIBLE;
      const minY = -d.box.top;
      const maxY = window.innerHeight - taskbar - 40 - d.box.top;
      setOffset(d.ox + Math.max(minX, Math.min(maxX, dx)), d.oy + Math.max(minY, Math.min(maxY, dy)));

      // Aero Shake: conta as viradas de direção horizontais rápidas.
      const dir = Math.sign(event.movementX);
      if (dir !== 0 && dir !== d.dir) {
        if (d.dir !== 0 && Math.abs(event.clientX - d.turnX) >= MIN_SWING) {
          const now = performance.now();
          d.swings = [...d.swings.filter((at) => now - at < WINDOW_MS), now];
          if (d.swings.length >= SWINGS) {
            d.swings = [];
            aeroShake();
          }
        }
        d.dir = dir;
        d.turnX = event.clientX;
      }
    };

    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      frame.classList.remove('is-dragging');
    };

    const onDouble = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('button, a, input')) return;
      reset();
    };
    const onMedia = () => {
      if (!media.matches) reset();
    };

    bar.addEventListener('pointerdown', onDown);
    bar.addEventListener('pointermove', onMove);
    bar.addEventListener('pointerup', onUp);
    bar.addEventListener('pointercancel', onUp);
    bar.addEventListener('dblclick', onDouble);
    media.addEventListener('change', onMedia);
    return () => {
      bar.removeEventListener('pointerdown', onDown);
      bar.removeEventListener('pointermove', onMove);
      bar.removeEventListener('pointerup', onUp);
      bar.removeEventListener('pointercancel', onUp);
      bar.removeEventListener('dblclick', onDouble);
      media.removeEventListener('change', onMedia);
    };
  }, [windowRef, enabled]);
}
