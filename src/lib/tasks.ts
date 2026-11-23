/**
 * Tarefas abertas pelos ícones da área de trabalho (janelas, o Media Player, o
 * Clippy, o BonziBuddy). Quem abre (DesktopIcons) publica a lista; a barra de
 * tarefas mostra um botão para cada uma, como a do portfólio: clicar minimiza
 * ou restaura.
 */
import { useSyncExternalStore } from 'react';

export interface Task {
  /** Identificador estável (também vai em data-task, no botão da barra). */
  readonly id: string;
  /** Nome no botão (e na dica). */
  readonly label: string;
  /** Ícone do botão. */
  readonly image?: string;
  readonly minimized: boolean;
  /** Minimiza (se à vista) ou restaura (se minimizada). */
  readonly toggle: () => void;
}

let tasks: readonly Task[] = [];
const listeners = new Set<() => void>();

export function publishTasks(next: readonly Task[]): void {
  tasks = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => tasks;

export function useTasks(): readonly Task[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Lista atual de tarefas, fora do React (ex.: o Aero Shake e o Flip 3D). */
export function getTasks(): readonly Task[] {
  return tasks;
}
