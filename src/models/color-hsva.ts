import type { ColorHSV } from './color-hsv';

export interface ColorHSVA extends ColorHSV {
  alpha: number; // Range: [0, 1]
}
