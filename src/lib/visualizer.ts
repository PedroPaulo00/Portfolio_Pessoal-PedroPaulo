/** Abre e fecha a visualização do Media Player (easter egg), de qualquer parte do site. */
import { useSyncExternalStore } from 'react';
import { unlockAchievement } from './achievements';

let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function openVisualizer(): void {
  if (open) return;
  open = true;
  unlockAchievement('visualizer');
  emit();
}

export function closeVisualizer(): void {
  if (!open) return;
  open = false;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useVisualizerOpen = () =>
  useSyncExternalStore(
    subscribe,
    () => open,
    () => open,
  );
