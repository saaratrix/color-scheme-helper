import type { Unsubscriber } from 'svelte/store';

export interface IsDragging {
  subscribe: (...args: unknown[]) => Unsubscriber;
  addDragging: () => void;
  removeDragging: () => void;
}
