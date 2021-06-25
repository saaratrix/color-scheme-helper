import type { ColorRGB } from '../models/color-rgb';
import type { ColorHSL } from '../models/color-hsl';
import type { ColorHSV } from '../models/color-hsv';

export function rgbToCSS(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function rgbaToCSS(r: number, g: number, b: number, a: number): string {
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}

export function hsvToRGBAToCSS(hue: number, saturation: number, value: number): string {
  const rgb = hsvToRGB(hue, saturation, value);
  return rgbaToCSS(rgb.red, rgb.green, rgb.blue, 1);
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
  return `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%`;
}

/**
 * Convert RGB to Hex
 * @param red Range: [0, 255]
 * @param blue Range: [0, 255]
 * @param green Range: [0, 255]
 */
export function rgbToHex(red: number, blue: number, green: number): string {
  let hexRed = red.toString(16);
  let hexGreen = green.toString(16);
  let hexBlue = blue.toString(16);

  if (hexRed === '0') { hexRed = '00'; }
  if (hexGreen === '0') { hexGreen = '00'; }
  if (hexBlue === '0') { hexBlue = '00'; }

  return `#${hexRed}${hexGreen}${hexBlue}`;
}

// Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
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
  switch (value) {
    case 0:
      break;
    case r:
      hue = 60 * (((g - b) / chroma));
      break;
    case g:
      hue = 60 * (2 + ((b -r ) / chroma));
      break;
    case b:
      hue = 60 * (4 + ((r - g) / chroma))
      break;
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
