import type { ColorHSVA } from '../models/colors/color-hsva';

export function hsvaEqualsHSVA(a: ColorHSVA, b: ColorHSVA): boolean {
  return a.hue === b.hue
    && a.saturation === b.saturation
    && a.value === b.value
    && a.alpha === b.alpha;
}
