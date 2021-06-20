import { writable } from 'svelte/store';

export const red = writable<number>(0);
export const green = writable<number>(0);
export const blue = writable<number>(0);
export const hue = writable<number>(0);
