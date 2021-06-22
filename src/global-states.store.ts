import { writable } from 'svelte/store';
import type { IsDragging } from './models/is-dragging';

/**
 * Create a custom store to handle the state if the user is currently dragging.
 */
function createIsDragging(): IsDragging {
  let interactingCounts: number = 0;
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    addDragging: () => {
      interactingCounts++;

      if (interactingCounts === 1) {
        set(true);
      }
    },
    removeDragging: () => {
      interactingCounts--;
      if (interactingCounts < 0) {
        console.log('too many draggers were removed!');
        interactingCounts = 0;
      }

      if (interactingCounts === 0) {
        set(false);
      }
    },
  }
}

export const isDragging: IsDragging = createIsDragging();
