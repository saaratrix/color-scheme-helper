export interface ColorSwatchEvents {
  // Outputs color in hex format.
  colorChanged: ColorSwatchColorChangedEvent;
}

export interface ColorSwatchColorChangedEvent {
  color: string;
}
