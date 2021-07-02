import type { ColorRGB } from './color-rgb';

export interface ColorRGBA extends ColorRGB {
  alpha: number;  // Range: [0, 1]
}
