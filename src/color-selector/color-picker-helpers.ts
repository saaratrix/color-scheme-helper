// Modified source: https://codepen.io/pizza3/pen/BVzYNP
export function drawRGBStrip(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
  gradient.addColorStop(1 / 6, 'rgba(255, 255, 0, 1)');
  gradient.addColorStop(2 / 6, 'rgba(0, 255, 0, 1)');
  gradient.addColorStop(3 / 6, 'rgba(0, 255, 255, 1)');
  gradient.addColorStop(4 / 6, 'rgba(0, 0, 255, 1)');
  gradient.addColorStop(5 / 6, 'rgba(255, 0, 255, 1)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

// Modified source: https://codepen.io/pizza3/pen/BVzYNP
/**
 *
 * @param color Example input: rgba(0, 0, 0, 1)
 */
export function drawHSVBlock(color: string, canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);

  // Draw a fully white gradient from left side to the right that will lose opacity.
  // So on the right side it's the full color.
  const whiteGradient = context.createLinearGradient(0, 0, width, 0);
  whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = whiteGradient;
  context.fillRect(0, 0, width, height);

  // Draw a fully black gradient from bottom to top.
  // So that on the bottom it's fully black and at the top it's the full color.
  const blackGradient = context.createLinearGradient(0, 0, 0, height);
  blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  context.fillStyle = blackGradient;
  context.fillRect(0, 0, width, height);
}
