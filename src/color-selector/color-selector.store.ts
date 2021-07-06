import { writable } from 'svelte/store';
import { ColorSelectionMode } from './models/color-selection-mode';
import type { IsDraggingColor } from './models/is-dragging-color';

// TODO: All hell breaks loose if changing the colour space! Lots of refactoring!
export const selectionMode = writable<ColorSelectionMode>(ColorSelectionMode.HSV)

/**
 * Range: [0, 1]
 */
export const alpha = writable<number>(1);

/**
 * Range: [0°, 360°]
 */
export const hue = writable<number>(360);
/**
 * Range: [0, 1]
 */
export const saturation = writable(1);
// TODO: Rename to brightness to not compete naming with "value"?
/**
 * Range: [0, 1]
 */
export const value = writable(1);


/**
 * Create a custom store to handle the state if the user is currently dragging.
 */
function createIsDraggingColor(): IsDraggingColor {
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
        console.log('nuu color picker: too many draggers were removed!');
        interactingCounts = 0;
      }

      if (interactingCounts === 0) {
        set(false);
      }
    },
  }
}

export const isDraggingColor: IsDraggingColor = createIsDraggingColor();
