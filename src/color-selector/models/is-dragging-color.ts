import type { Unsubscriber } from 'svelte/store';

export interface IsDraggingColor {
  subscribe: (...args: unknown[]) => Unsubscriber;
  addDragging: () => void;
  removeDragging: () => void;
}
