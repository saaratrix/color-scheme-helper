import type { ColorHSVA } from '../color-selector/models/colors/color-hsva';

export interface SelectedColorsEvents {
  // Outputs color in hex format.
  colorChanged: SelectedColorsColorChangedEvent;
}

export interface SelectedColorsColorChangedEvent {
  color: string;
}
