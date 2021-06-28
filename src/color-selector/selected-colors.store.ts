import { writable } from 'svelte/store';
import { ColorSelectionMode } from './color-selection-mode';

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
