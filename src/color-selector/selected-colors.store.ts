import { writable } from 'svelte/store';
import { ColorSelectionMode } from './color-selection-mode';

// TODO: All hell breaks loose if changing the colour space! Lots of refactoring!
export const selectionMode = writable<ColorSelectionMode>(ColorSelectionMode.HSV)

export const red = writable<number>(255);
export const green = writable<number>(0);
export const blue = writable<number>(0);
export const hue = writable<number>(360);
export const saturation = writable(1);
// TODO: Rename to brightness to not compete naming with "value"?
export const value = writable(1);
