// Modified source: https://codepen.io/pizza3/pen/BVzYNP
import type { ColorGradients } from './color-gradients';

export function drawRGBStrip(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  // This gradient makes hue go from 360° -> 0°
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
  gradient.addColorStop(1 / 6, 'rgba(255, 0, 255, 1)');
  gradient.addColorStop(2 / 6, 'rgba(0, 0, 255, 1)');
  gradient.addColorStop(3 / 6, 'rgba(0, 255, 255, 1)');
  gradient.addColorStop(4 / 6, 'rgba(0, 255, 0, 1)');
  gradient.addColorStop(5 / 6, 'rgba(255, 255, 0, 1)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  // Because gradient.addColorStop doesn't always add the final colour we manually add the last color
  // So without this the final colour might be 255, 0, 3
  context.fillStyle = 'rgb(255, 0, 0)';
  context.fillRect(0, height - 1, width, 1);
}

// Modified source: https://codepen.io/pizza3/pen/BVzYNP
/**
 *
 * @param color Example input: rgba(0, 0, 0, 1)
 */
export function drawHSVBlock(color: string, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, gradients: ColorGradients): void {
  const width = canvas.width;
  const height = canvas.height;
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);

  context.fillStyle = gradients.xGradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = gradients.yGradient;
  context.fillRect(0, 0, width, height);
}

export function createHSVGradients(width: number, height: number, context: CanvasRenderingContext2D): ColorGradients {
  // Draw a fully white gradient from left side to the right that will lose opacity.
  // So on the right side it's the full color.
  const whiteGradient = context.createLinearGradient(0, 0, width, 0);
  whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  // Draw a fully black gradient from bottom to top.
  // So that on the bottom it's fully black and at the top it's the full color.
  const blackGradient = context.createLinearGradient(0, 0, 0, height);
  blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

  return {
    xGradient: whiteGradient,
    yGradient: blackGradient,
  }
}

export function drawAlphaBackground(width: number, height: number, context: CanvasRenderingContext2D): void {
  const darkColor = 'rgb(192, 192, 192)';
  const lightColor = 'rgb(255, 255, 255)';
  // Size in pixels
  const size = 8;
  const doubleSize = size * 2;

  context.fillStyle = darkColor;
  // Fill the whole draw area in dark
  context.fillRect(0, 0, width, height);
  context.fillStyle = lightColor;

  // Then we draw the tiles 2 blocks at a time like this repeated over x axis then y axis.
  // * l
  // l *
  // * is where the dark tile would have been but it's already dark because we filled the whole canvas.
  for (let y = 0; y < height; y += doubleSize) {
    for (let x = 0; x < width; x += doubleSize) {
      context.fillRect(x + size, y, size, size);
      context.fillRect(x, y + size, size, size);
    }
  }
}
