import type { ColorRGB } from '../models/color-rgb';
import type { ColorHSL } from '../models/color-hsl';
import type { ColorHSV } from '../models/color-hsv';
import type { ColorRGBA } from '../models/color-rgba';

export function rgbToCSS(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function rgbaToCSS(r: number, g: number, b: number, a: number): string {
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}

export function hsvToRGBAToCSS(hue: number, saturation: number, value: number, alpha: number): string {
  const rgb = hsvToRGB(hue, saturation, value);
  return rgbaToCSS(rgb.red, rgb.green, rgb.blue, alpha);
}

/**
 * Converts HSV to HSL and then to CSS.
 * @param hue Range: [0°, 360°]
 * @param saturation Range: [0, 1]
 * @param value Range: [0, 1]
 */
export function hsvToCSS(hue: number, saturation: number, value: number): string {
  let hsl = hsvToHSL(hue, saturation, value);
  hsl = getViewHSL(hsl.hue, hsl.saturation, hsl.lightness);
  return `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%)`;
}

export function hsvaToCSS(hue: number, saturation: number, value: number, alpha: number): string {
  let hsl = hsvToHSL(hue, saturation, value);
  hsl = getViewHSL(hsl.hue, hsl.saturation, hsl.lightness);
  return `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%, ${alpha})`;
}

/**
 * Convert RGB to Hex
 * @param red Range: [0, 255]
 * @param blue Range: [0, 255]
 * @param green Range: [0, 255]
 */
export function rgbToHex(red: number, green: number, blue: number): string {
  let hexRed = componentToHex(red);
  let hexGreen = componentToHex(green);
  let hexBlue = componentToHex(blue);

  return `#${hexRed}${hexGreen}${hexBlue}`;
}

export function rgbaToHex(red: number, green: number, blue: number, alpha: number): string {
  let hex = rgbToHex(red, green, blue);
  const alphaHex = componentToHex(alpha);
  return hex + alphaHex;
}

export function componentToHex(color: number): string {
  let hex = color.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

// Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
// Formula for hue: // Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
/**
 * Convert RGB to HSV
 * @param red Range: [0, 255]
 * @param blue Range: [0, 255]
 * @param green Range: [0, 255]
 */
export function rgbToHSV(red: number, green: number, blue: number): ColorHSV {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const value = Math.max(r, g, b);
  const xMin = Math.min(r, g, b);
  const chroma = value - xMin;
  let saturation = 0;
  if (value !== 0) {
    saturation = chroma / value;
  }

  let hue: number = 0;

  if (chroma !== 0) {
    switch (value) {
      case 0:
        break;
      case r:
        hue = ((g - b) / chroma) % 6;
        break;
      case g:
        hue = ((b - r) / chroma) + 2
        break;
      case b:
        hue = ((r - g) / chroma) + 4;
        break;
    }
  }

  hue *= 60;
  if (hue < 0) {
    hue += 360;
  }
  hue = Math.round(hue);

  return {
    hue,
    saturation,
    value,
  };
}


// Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
/**
 * Convert HSV values to RGB values.
 * @param hue Range: [0°, 360°]
 * @param saturation Range: [0, 1]
 * @param value Range: [0, 1]
 */
export function hsvToRGB(hue: number, saturation: number, value: number): ColorRGB {
  let red: number = 0;
  let green: number = 0;
  let blue: number = 0;

  let chroma = saturation * value;
  const deltaHue = hue / 60;
  let x = chroma * (1 - Math.abs((deltaHue % 2) - 1));
  // 5 < H' <= 6
  if (deltaHue > 5) {
    red = chroma;
    blue = x;
    // 4 < H' <= 5
  } else if (deltaHue > 4) {
    red = x;
    blue = chroma;
    // 3 < H' <= 4
  } else if (deltaHue > 3) {
    green = x;
    blue = chroma;
    // 2 < H' <= 3
  } else if (deltaHue > 2) {
    green = chroma;
    blue = x;
    // 1 < H' <= 2
  } else if (deltaHue > 1) {
    red = x;
    green = chroma;
    // 0 <= H' <= 1
  } else {
    red = chroma;
    green = x;
  }

  const m = value - chroma;
  red = Math.round((red + m) * 255);
  green = Math.round((green + m) * 255);
  blue = Math.round((blue + m) * 255);

  return {
    red,
    green,
    blue,
  };
}

// Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL
/**
 * Rounds and multiplies saturation & lightness by 100.
 * @param hue Range: [0°, 360°]
 * @param saturation Range: [0, 1]
 * @param value Range: [0, 1]
 */
export function hsvToHSL(hue: number, saturation: number, value: number): ColorHSL {
  const l = value * (1 - saturation / 2);
  // sv = 0 if value == 0
  let sv = 0;
  if (value !== 0) {
    sv = (value - l) / Math.min(l, 1 - l);
  }

  return {
    // Hl = Hv
    hue,
    saturation: sv,
    lightness: l,
  };
}

/**
 * Rounds and multiplies saturation & lightness by 100.
 * @param hue Range: [0°, 360°]
 * @param saturation Range: [0, 1]
 * @param lightness Range: [0, 1]
 */
export function getViewHSL(hue: number, saturation: number, lightness: number): ColorHSL {
  return {
    hue,
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100),
  };
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
export function hexToRGB(hex: string): ColorRGBA {
  const rgba: ColorRGBA = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255,
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
    rgba.alpha = parseInt(hex[a1] + hex[a2], 16);
  }
}
