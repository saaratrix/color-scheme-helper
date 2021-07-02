import type { ColorRGB } from '../models/color-rgb';
import type { ColorHSL } from '../models/color-hsl';
import type { ColorHSV } from '../models/color-hsv';
import type { ColorRGBA } from '../models/color-rgba';


/**
 * Convert RGB to rgb(red, green, blue)
 * @param red Range: [0, 255]
 * @param green Range: [0, 255]
 * @param blue Range: [0, 255]
 */
export function rgbToCSS(red: number, green: number, blue: number): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Convert RGBA to rgba(red, green, blue, alpha)
 * @param red Range: [0, 255]
 * @param green Range: [0, 255]
 * @param blue Range: [0, 255]
 * @param alpha Range: [0, 1]
 */
export function rgbaToCSS(red: number, green: number, blue: number, alpha: number): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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

/**
 * Convert HSVA to HSLA
 * @param hue
 * @param saturation
 * @param value
 * @param alpha
 */
export function hsvaToCSS(hue: number, saturation: number, value: number, alpha: number): string {
  let hsl = hsvToHSL(hue, saturation, value);
  hsl = getViewHSL(hsl.hue, hsl.saturation, hsl.lightness);
  return `hsla(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%, ${alpha})`;
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

/**
 * Convert RGBA to HEX.
 * @param red Range: [0, 255]
 * @param blue Range: [0, 255]
 * @param green Range: [0, 255]
 * @param alpha Range: [0, 1]
 */
export function rgbaToHex(red: number, green: number, blue: number, alpha: number): string {
  // We floor the alpha rounding so that if it's 0.99 it's still 245.
  alpha = Math.floor(alpha * 255);

  let hex = rgbToHex(red, green, blue);
  const alphaHex = componentToHex(alpha);
  return hex + alphaHex;
}

/**
 * Convert a color component from 0 -> 255 into hex.
 * @param color Range: [0, 255]
 */
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
 * Convert HSV to HSL.
 * @param hue Range: [0°, 360°]
 * @param saturation Range: [0, 1]
 * @param value Range: [0, 1]
 */
export function hsvToHSL(hue: number, saturation: number, value: number): ColorHSL {
  const lightness = value * (1 - saturation / 2);
  // sv = 0 if value == 0
  let sl = 0;
  if (value !== 0) {
    sl = (value - lightness) / Math.min(lightness, 1 - lightness);
  }

  return {
    // Hl = Hv
    hue,
    saturation: sl,
    lightness,
  };
}

// Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_HSV
/**
 * Convert HSL to HSV.
 * @param hue Range: [0°, 360°]
 * @param saturation Range: [0, 1]
 * @param lightness Range: [0, 1]
 */
export function hslToHSV(hue: number, saturation: number, lightness: number): ColorHSV {
  const value = lightness + saturation * Math.min(lightness, 1 - lightness);
  let sv = 0;
  if (value !== 0) {
    sv = 2 * (1 - lightness / value);
  }

  return {
    // Hv = Hl
    hue,
    saturation: sv,
    value,
  };
}

/**
 * Rounds and multiplies saturation & lightness so it's in the range of 0 -> 100.
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

export function roundAlpha(alpha: number): number {
  // 3 decimal precision for alpha,  1 / 255 = 0.0039
  // Also round to 3 decimal precision or it could look like 0.12381624.
  return Math.floor(alpha * 1000) / 1000;
}
