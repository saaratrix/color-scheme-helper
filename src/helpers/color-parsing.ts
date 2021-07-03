import type { ColorHSVA } from '../models/color-hsva';
import { hslToHSV, rgbToHSV, roundAlpha } from './color-space-helpers';
import type { ColorRGBA } from '../models/color-rgba';

function parseAlpha(value: string): number {
  // Result[5] exists if the alpha channel existed otherwise parseFloat(undefined) == NaN.
  let alpha = parseFloat(value);
  alpha = !isNaN(alpha) ? alpha : 1;
  alpha = roundAlpha(alpha);
  return alpha;
}

/**
 * Parses the following inputs:
 * hsl(0, 100%, 100%)
 * hsl(0, 100%, 100%, 1) -- This is alpha for dummies like me, hsvaToCSS returned hsl() instead of hsla()!
 * hsla(0, 100%; 100, 1)
 */
export function parseHSLFromCSS(color: string, targetColor: ColorHSVA): void {
  const regex = /hsla?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3}%?)\s*,\s*([0-9]{1,3}%?)\s*(,\s*([0-9]+(\.+[0-9]+)?)\s*)?\)/m;
  // Example groups:
  // [0]: hsl(0, 50%, 75%, 0.1)
  // [1]:	0
  // [2]: 50%
  // [3]: 75%
  // [4]: , 0.1
  // [5]: 0.1
  // [6]: .1
  const result = color.match(regex);
  if (!result) {
    return;
  }

  const h = parseInt(result[1], 10);
  const s = parseInt(result[2], 10) / 100;
  const l = parseInt(result[3], 10) / 100;

  const hsv = hslToHSV(h, s, l);
  const a = parseAlpha(result[5]);

  targetColor.hue = hsv.hue;
  targetColor.saturation = hsv.saturation;
  targetColor.value = hsv.value;
  targetColor.alpha = a;
}

/**
 * Parses the following inputs:
 * rgb(255, 128, 0)
 * rgb(255, 128, 0, 0.2)
 * rgba(255, 128, 0, 0.2)
 */
export function parseRGBFromCSS(color: string, targetColor: ColorHSVA): void {
  const regex = /rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*(,\s*([0-9]+(\.[0-9])?)\s*)?\)/m;
  // Example groups:
  // [0]: rgba(255, 128, 0, 0.2)
  // [1]:	255
  // [2]: 128
  // [3]: 0
  // [4]: , 0.2
  // [5]: 0.2
  // [6]: .2
  const result = color.match(regex);
  if (!result) {
    return;
  }

  const r = parseInt(result[1], 10);
  const g = parseInt(result[2], 10);
  const b = parseInt(result[3], 10);

  const hsv = rgbToHSV(r, g, b);
  const a = parseAlpha(result[5]);

  targetColor.hue = hsv.hue;
  targetColor.saturation = hsv.saturation;
  targetColor.value = hsv.value;
  targetColor.alpha = a;
}

// Regex source: https://stackoverflow.com/a/53936623/2437350
/**
 * Finds hex values for for #fff, #ffff, #ffffff, #ffffffff and without #.
 */
export const getHexValuesRegex = /^#?([a-fA-F0-9]{3,4}){1,2}$/;

/**
 * Hex string to RGB.
 * Example of input: #abc, #aabbccdd (alpha), #aabbcc #aabbccdd (alpha)
 */
export function parseHexToRGBA(hex: string): ColorRGBA {
  const rgba: ColorRGBA = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 1,
  };

  if (!getHexValuesRegex.test(hex)) {
    return rgba;
  }

  if (hex[0] === '#') {
    hex = hex.substring(1);
  }

  if (hex.length === 3) {
    extractHex(hex, rgba, 0, 0, 1, 1, 2, 2);
  } else if (hex.length === 6) {
    extractHex(hex, rgba, 0, 1, 2, 3, 4, 5);
  } else if (hex.length === 4) {
    extractHex(hex, rgba, 0, 0, 1, 1, 2, 2, 3, 3);
  } else if (hex.length === 8) {
    extractHex(hex, rgba, 0, 1, 2, 3, 4, 5, 6, 7);
  }

  return rgba;
}

function extractHex(hex: string, rgba: ColorRGBA, r1, r2, g1, g2, b1, b2, a1 = -1, a2 = -1): void {
  rgba.red = parseInt(hex[r1] + hex[r2], 16);
  rgba.green = parseInt(hex[g1] + hex[g2], 16);
  rgba.blue = parseInt(hex[b1] + hex[b2], 16);

  if (a1 > 0) {
    const alpha = parseInt(hex[a1] + hex[a2], 16);
    rgba.alpha = alpha / 255;
  }
}
