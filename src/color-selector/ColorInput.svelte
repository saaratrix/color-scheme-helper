<script lang="ts">
  import { hue, saturation, value } from './selected-colors.store';
  import { clamp } from '../helpers/math-helpers';
  import type { ColorRGB } from '../models/color-rgb';
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import { hsvToRGB, rgbToHex, rgbToHSV } from '../helpers/color-space-helpers';

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

    updateHSV();
  }

  function onGreenChange(event: InputEvent): void {
    let green = getAndSetRoundedInputValue(event);
    green = clampInput(green, 0, 255);
    rgb.green = green;

    updateHSV();
  }

  function onBlueChange(event: InputEvent): void {
    let blue = getAndSetRoundedInputValue(event);
    blue = clampInput(blue, 0, 255);
    rgb.blue = blue;

    updateHSV();
  }

  function onHexChange(event: InputEvent): void {

  }

  function updateHSV(): void {
    const hsv = rgbToHSV(rgb.red, rgb.green, rgb.blue);

    hue.set(hsv.hue);
    saturation.set(hsv.saturation);
    value.set(hsv.value);
  }

  function updateRGBAndHex(h: number, s: number, v: number): void {
    const color = hsvToRGB(h, s, v);
    rgb.red = color.red;
    rgb.green = color.green;
    rgb.blue = color.blue;

    hex = rgbToHex(rgb.red, rgb.green, rgb.blue);
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
  .color-input-selected-container {
    display: grid;
    grid-gap: 0.4rem;
  }

  .color-group {
    display: grid;
    grid-gap: 0.25rem;
  }

  label {
    display: inline-block;
    width: 2rem;
    text-align:right;
  }

  input {
    width: 5.5rem;
    padding: 0.125rem;
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

<div class="color-input-selected-container">
  <div class="color-group">
    <div class="input-group">
      <label for="nuu_hsv_hue">H: </label>
      <input id="nuu_hsv_hue" value={$hue} on:input={onHueChange} type="number" step="1" min="0" max="360">
    </div>
    <div class="input-group">
      <label for="nuu_hsv_saturation">S: </label>
      <input id="nuu_hsv_saturation" value={Math.round($saturation * 100)} on:input={onSaturationChange} type="number" step="1" min="0" max="100">
    </div>
    <div class="input-group">
      <label for="nuu_hsv_value">V: </label>
      <input id="nuu_hsv_value" value={Math.round($value * 100)} on:input={onValueChange} type="number" step="1" min="0" max="100">
    </div>
  </div>
  <div class="color-group">
    <div class="input-group">
      <label for="nuu_red">R: </label>
      <input id="nuu_red" value={rgb.red} on:input={onRedChange} type="number" step="1" min="0" max="255">
    </div>
    <div class="input-group">
      <label for="nuu_green">G: </label>
      <input id="nuu_green" value={rgb.green} on:input={onGreenChange} type="number" step="1" min="0" max="255">
    </div>
    <div class="input-group">
      <label for="nuu_blue">B: </label>
      <input id="nuu_blue" value={rgb.blue} on:input={onBlueChange} type="number" step="1" min="0" max="255">
    </div>
    <div class="input-group">
      <label for="nuu_hex">HEX: </label>
      <input id="nuu_hex" value="{hex}" on:input={onHexChange} type="text">
    </div>
  </div>
</div>
