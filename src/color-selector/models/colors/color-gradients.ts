export interface ColorGradients {
  // The gradient along the x axis.
  // For HSV color space that's white on the left and transparent on the right.
  xGradient: CanvasGradient;
  // The gradient along the y axis.
  // For HSV color space that's black at the bottom and transparent at the top.
  yGradient: CanvasGradient;
}
