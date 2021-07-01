<script lang="ts">
  import { alpha, hue, saturation, value } from './selected-colors.store';
  import { clamp } from '../helpers/math-helpers';
  import type { ColorRGB } from '../models/color-rgb';
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import { hexToRGB, hsvToRGB, rgbaToHex, rgbToHex, rgbToHSV } from '../helpers/color-space-helpers';

  // If we update RGB colors or hex directly we don't want to HSV events to update the RGB values because it makes it impossible to edit values!
  let blockRGBHexUpdate: boolean = false;
  let rgb: ColorRGB = { red: 0, green: 0, blue: 0 };
  let hex: string = "";
  const subscriptions: Unsubscriber[] = [];

  onMount((): void => {
    updateRGBAndHex($hue, $saturation, $value);

    subscriptions.push(
      hue.subscribe((h): void => {
        updateRGBAndHex(h, $saturation, $value);
      }),
      saturation.subscribe((s): void => {
        updateRGBAndHex($hue, s, $value);
      }),
      value.subscribe((v): void => {
        updateRGBAndHex($hue, $saturation, v);
      }),
    );
  });

  onDestroy((): void => {
    for (const subscription of subscriptions) {
      subscription();
    }
  });

  function onHueChange(event: InputEvent): void {
    const h = getAndSetRoundedInputValue(event);
    const clampedValue = clampInput(h, 0, 360);
    hue.set(clampedValue);
  }

  function onSaturationChange(event: InputEvent): void {
    const s = getAndSetRoundedInputValue(event);
    const clampedValue = clampInput(s, 0, 100) / 100;
    saturation.set(clampedValue);
  }

  function onValueChange(event: InputEvent): void {
    const s = getAndSetRoundedInputValue(event);
    const clampedValue = clampInput(s, 0, 100) / 100;
    value.set(clampedValue);
  }

  function onRedChange(event: InputEvent): void {
    let red = getAndSetRoundedInputValue(event);
    red = clampInput(red, 0, 255);
    rgb.red = red;
    hex = rgbToHex(rgb.red, rgb.green, rgb.blue);

    updateHSV();
  }

  function onGreenChange(event: InputEvent): void {
    let green = getAndSetRoundedInputValue(event);
    green = clampInput(green, 0, 255);
    rgb.green = green;
    hex = rgbToHex(rgb.red, rgb.green, rgb.blue);

    updateHSV();
  }

  function onBlueChange(event: InputEvent): void {
    let blue = getAndSetRoundedInputValue(event);
    blue = clampInput(blue, 0, 255);
    rgb.blue = blue;
    hex = rgbToHex(rgb.red, rgb.green, rgb.blue);

    updateHSV();
  }

  function onAlphaChange(event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    let a = parseFloat(target.value);
    a = clampInput(a, 0, 1);

    alpha.set(a);

    updateHex(rgb.red, rgb.green, rgb.blue, a);
  }

  function onHexChange(event: InputEvent): void {
    const element = event.target as HTMLInputElement;
    const hex = element.value;
    const rgba = hexToRGB(hex);

    rgb.red = rgba.red;
    rgb.green = rgba.green;
    rgb.blue = rgba.blue;

    // 3 decimal precision for alpha,  1 / 255 = 0.0039
    const a = Math.round(rgba.alpha * 1000) / 1000;
    alpha.set(a);

    updateHSV();
  }

  function updateHSV(): void {
    const oldHue = $hue;
    const hsv = rgbToHSV(rgb.red, rgb.green, rgb.blue);

    blockRGBHexUpdate = true;

    // This is so that we don't jump with the hue if you are adjusting the RGB values and they all align
    // Which makes it become a greyscale value and thus hue is calculated as 0.
    if (rgb.red === rgb.green && rgb.red === rgb.blue && oldHue !== 0) {
      hsv.hue = oldHue;
    }

    hue.set(hsv.hue);
    saturation.set(hsv.saturation);
    value.set(hsv.value);

    blockRGBHexUpdate = false;
  }

  function updateRGBAndHex(h: number, s: number, v: number): void {
    if (blockRGBHexUpdate) {
      return;
    }

    const color = hsvToRGB(h, s, v);
    rgb.red = color.red;
    rgb.green = color.green;
    rgb.blue = color.blue;

    updateHex(rgb.red, rgb.green, rgb.red, $alpha);
  }

  /**
   * Update the hex and add alpha if less than 255.
   * @param red Range: [0, 255]
   * @param green Range: [0, 255]
   * @param blue Range: [0, 255]
   * @param a Range: [0, 1]
   */
  function updateHex(red: number, green: number, blue: number, a: number): void {
    if (a === 1) {
      hex = rgbToHex(red, green, blue);
    } else {
      hex = rgbaToHex(red, green, blue, a);
    }
  }

  function getAndSetRoundedInputValue(event: InputEvent): number {
    const target = event.target as HTMLInputElement;
    const value =  Math.round(parseFloat(target.value));
    target.value = value.toString();
    return value;
  }

  function clampInput(value: number, min: number, max: number): number {
    if (!isFinite(value) || isNaN(value)) {
      value = min;
    }
    return clamp(value, min, max);
  }

</script>
<style lang="scss">
  $label-length: 34px;
  $input-length: 84px;

  .color-input-container {
    display: grid;
    grid-gap: 6px;
  }

  .color-group {
    display: grid;
    grid-gap: 4px;
  }

  .input-group {
    display: flex;
    align-items: center;
    width: $label-length + $input-length;
  }

  .label-text {
    display: inline-block;
    width: $label-length;
    padding-right: 4px;
    text-align: right;
  }

  input {
    width: $input-length;
    padding: 2px;
    text-align: right;
  }

  // Hide the arrows for a number.
  // Source: https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
</style>

<div class="color-input-container">
  <div class="color-group">
    <label class="input-group">
      <span class="label-text">H:</span>
      <input value={$hue} on:input={onHueChange} type="number" step="1" min="0" max="360">
    </label>
    <label class="input-group">
      <span class="label-text">S:</span>
      <input value={Math.round($saturation * 100)} on:input={onSaturationChange} type="number" step="1" min="0" max="100">
    </label>
    <label class="input-group">
      <span class="label-text">V:</span>
      <input value={Math.round($value * 100)} on:input={onValueChange} type="number" step="1" min="0" max="100">
    </label>
  </div>
  <div class="color-group">
    <label class="input-group">
      <span class="label-text">R:</span>
      <input value={rgb.red} on:input={onRedChange} type="number" step="1" min="0" max="255">
    </label>
    <label class="input-group">
      <span class="label-text">G:</span>
      <input value={rgb.green} on:input={onGreenChange} type="number" step="1" min="0" max="255">
    </label>
    <label class="input-group">
      <span class="label-text">B:</span>
      <input value={rgb.blue} on:input={onBlueChange} type="number" step="1" min="0" max="255">
    </label>
    <label class="input-group">
      <span class="label-text">A:</span>
      <input value={$alpha} on:input={onAlphaChange} type="number" step="0.01" min="0" max="1">
    </label>
    <label class="input-group">
      <span class="label-text">HEX:</span>
      <input value="{hex}" on:input={onHexChange} type="text">
    </label>
  </div>
</div>
