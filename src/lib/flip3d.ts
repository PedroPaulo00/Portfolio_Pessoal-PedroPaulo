/** Abre e fecha o Flip 3D (janelas em 3D), de qualquer parte do site. */
import { useSyncExternalStore } from 'react';
import { unlockAchievement } from './achievements';

let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function openFlip3D(): void {
  if (open) return;
  open = true;
  unlockAchievement('flip3d');
  emit();
}

export function closeFlip3D(): void {
  if (!open) return;
  open = false;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useFlip3DOpen = () =>
  useSyncExternalStore(
    subscribe,
    () => open,
    () => open,
  );
