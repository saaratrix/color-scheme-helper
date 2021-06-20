export function toRGBforCSS(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function toRGBAforCSS(r: number, g: number, b: number, a: number): string {
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}

// Modified source: https://stackoverflow.com/q/39118528/2437350
// Theory: https://en.wikipedia.org/wiki/HSL_and_HSV
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
