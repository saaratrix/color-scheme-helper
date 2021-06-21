import type { ColorRGB } from '../models/color-rgb';

export function toRGBForCSS(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function toRGBAForCSS(r: number, g: number, b: number, a: number): string {
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}

export function hsvToRGBAForCSS(hue: number, saturation: number, value: number): string {
  const rgb = hsvToRGB(hue, saturation, value);
  return toRGBAForCSS(rgb.red, rgb.green, rgb.blue, 1);
}

// Modified source: https://stackoverflow.com/q/39118528/2437350
// Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
export function getHueFromRGB(r: number, g: number, b: number): number {
  // Convert colours into 0 -> 1 range.
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (min === max) {
    return 0;
  }

  const chroma = max - min;
  let hue: number;
  if (chroma === r) {
    hue = ((g - b) / chroma) % 6;
  } else if (chroma === g) {
    hue = ((b - r) / chroma) + 2
  // chroma === b
  } else {
    hue = ((r - g) / chroma) + 4;
  }

  hue *= 60;
  if (hue < 0) {
    hue += 360;
  }
  // ceil rounding makes us hit 360 degrees at rgb(255, 0, 3) which is top colour of the gradient.
  return Math.ceil(hue);
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
