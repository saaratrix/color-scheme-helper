<script lang="ts">
  import ColorPicker from "./ColorPicker.svelte";
  import ColorInput from "./ColorInput.svelte";
  import { hsvToCSS } from "../helpers/color-space-helpers";
  import { hue, saturation, value } from './selected-colors.store';
  import type { ColorHSV } from '../models/color-hsv';
  import { onMount } from 'svelte';

  let oldHSVColor: ColorHSV = {
    hue: Math.round(Math.random() * 360),
    saturation: Math.random(),
    value: Math.random(),
  }

  onMount(() => {
    // Set the color to the input color.
    resetColor();
  });

  function resetColor(): void {
    hue.set(oldHSVColor.hue);
    saturation.set(oldHSVColor.saturation);
    value.set(oldHSVColor.value);
  }

  function selectColor(): void {
    oldHSVColor.hue = $hue;
    oldHSVColor.saturation = $saturation;
    oldHSVColor.value = $value;
  }
</script>
<style lang="scss">
  $selected-color-height: 32px;
  $selected-color-width: 2.75rem;

  .color-selector {
    display: inline-flex;
    padding: 0.5rem;
    border: 1px solid #bbb;
    border-radius: 4px;
    box-shadow: 5px 5px 25px 5px rgba(0,0,0,0.2);
  }

  .color-input-container {
    display: grid;
    grid-gap: 0.4rem;
    padding: 0 0.25rem;
  }

  .color-selected-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .selected-color-container {
    // This also removes whitespace which adds 4 pixels to the height.
    display: flex;
  }

  .selected-color {
    display: inline-block;
    width: $selected-color-width;
    height: $selected-color-height;
  }

  .selected-color-old {
    cursor: pointer;
  }

  .color-confirm-button {
    display: inline-block;
    padding: 0 0.25rem;
    font-weight: bold;
    font-size: 1.5em;
    color: green;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: lime;
    }

    &:active {
      color: #ac73bc;
    }
  }
</style>

<div class="color-selector">
  <div class="color-picker-container">
    <ColorPicker />
  </div>
  <div class="color-input-container">
    <ColorInput />
    <div class="color-selected-container">
      <div class="selected-color-container">
        <div class="selected-color selected-color-new" style="background-color: { hsvToCSS($hue, $saturation, $value) }"></div>
        <div class="selected-color selected-color-old" on:click={resetColor} style="background-color: { hsvToCSS(oldHSVColor.hue, oldHSVColor.saturation, oldHSVColor.value) }"></div>
      </div>
      <div class="color-confirm" on:click={selectColor}><span class="color-confirm-button" title="OK!">✓</span></div>
    </div>

  </div>
</div>

