<script lang="ts">
  import ColorPicker from "./ColorPicker.svelte";
  import ColorInput from "./ColorInput.svelte";
  import NuuSelectedColor from "./NuuSelectedColor.svelte";
  import { hue, saturation, value, alpha } from './selected-colors.store';
  import type { ColorHSVA } from '../models/color-hsva';
  import { onMount } from 'svelte';
  import { parseHexToRGBA, parseHSLFromCSS, parseRGBFromCSS } from '../helpers/color-parsing';
  import { rgbToHSV, roundAlpha } from '../helpers/color-space-helpers';

  export let color: string = '';
  $: color, parseColor();

  // Give default value or it'll crash when mounting components.
  let oldHSVAColor: ColorHSVA = createDefaultHSVColor();

  onMount(() => {
    parseColor();
  });

  function parseColor(): void {
    let parsedColor: ColorHSVA = createDefaultHSVColor();
    // For example `color` would make the value be true and then color.startsWith would fail.
    if (!color || !color.startsWith) {
      console.log('nuu color picker: could not parse input color.');
      oldHSVAColor = parsedColor
      return;
    }

    // Parse the input color!
    if (color.includes('hsl')) {
      // Parse it as HSL!
      parseHSLFromCSS(color, parsedColor);
    } else if (color.includes('rgb')) {
      // Parse it as RGBA
      parseRGBFromCSS(color, parsedColor);
    } else {
      parseHex(color, parsedColor);
    }

    // It's easier to set alpha first than to fix the event bug that changing hex would update alpha which would unset everything!
    // So if the UI changes that bug needs to be solved.
    alpha.set(parsedColor.alpha);
    hue.set(parsedColor.hue);
    saturation.set(parsedColor.saturation);
    value.set(parsedColor.value);
    oldHSVAColor = parsedColor;
  }

  function parseHex(color: string, targetColor: ColorHSVA): void {
    // Parse it as HEX!
    const rgba = parseHexToRGBA(color);
    const hsv = rgbToHSV(rgba.red, rgba.green, rgba.blue);
    const a = roundAlpha(rgba.alpha);
    targetColor.hue = hsv.hue;
    targetColor.saturation = hsv.saturation;
    targetColor.value = hsv.value;
    targetColor.alpha = a;
  }

  function createDefaultHSVColor(): ColorHSVA {
    return {
      hue: 360,
      saturation: 1,
      value: 1,
      alpha: 1,
    };
  }

  function selectColor(): void {
    oldHSVAColor.hue = $hue;
    oldHSVAColor.saturation = $saturation;
    oldHSVAColor.value = $value;
    oldHSVAColor.alpha = $alpha;
  }
</script>
<style lang="scss">

  .color-selector {
    display: inline-flex;
    padding: 8px;
    border: 1px solid #bbb;
    border-radius: 4px;
    box-shadow: 5px 5px 25px 5px rgba(0,0,0,0.2);
  }

  .color-input-container {
    display: grid;
    grid-gap: 6px;
    padding: 0 4px;
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

  .color-confirm-button {
    display: inline-block;
    padding: 0 4px;
    font-weight: bold;
    font-size: 16pt;
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
        <NuuSelectedColor bind:oldHSVAColor="{oldHSVAColor}" />
      </div>
      <div class="color-confirm" on:click={selectColor}><span class="color-confirm-button" title="OK!">✓</span></div>
    </div>
  </div>
</div>

