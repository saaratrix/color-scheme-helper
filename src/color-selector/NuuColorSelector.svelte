<script lang="ts">
  import NuuColorPicker from "./NuuColorPicker.svelte";
  import NuuColorInput from "./NuuColorInput.svelte";
  import NuuSelectedColor from "./NuuSelectedColor.svelte";
  import NuuColorConfirm from "./NuuColorConfirm.svelte";
  import { hue, saturation, value, alpha } from './color-selector.store';
  import type { ColorHSVA } from './models/colors/color-hsva';
  import { parseHexToRGBA, parseHSLFromCSS, parseRGBFromCSS } from './helpers/color-parsing';
  import { hsvToRGB, rgbaToHex, rgbToHSV, roundAlpha } from './helpers/color-space-helpers';
  import { createEventDispatcher } from 'svelte';
  import type { NuuColorSelectorEvents } from './models/events/nuu-color-selector-events';

  const dispatch = createEventDispatcher<NuuColorSelectorEvents>();

  let oldHSVAColor: ColorHSVA = createDefaultHSVColor();
  export let color: string = '';
  $: color, parseColor();

  function parseColor(): void {
    let parsedColor: ColorHSVA = createDefaultHSVColor();
    // For example `color` would make the value be true and then color.startsWith would fail.
    if (!color || !color.startsWith) {
      console.log('nuu color picker: could not parse input color.');
      oldHSVAColor = parsedColor;
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

    // Without setTimeout the old color isn't updating and instead it gets 360, 1, 1 as the values.
    // I'm guessing that is because of some user error, or Svelte event gone wrong! But probably user error.
    setTimeout(() => {
      oldHSVAColor = parsedColor;
    });
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

    const rgb = hsvToRGB($hue, $saturation, $value);
    const hex = rgbaToHex(rgb.red, rgb.green, rgb.blue, $alpha, true);

    dispatch('colorPicked', hex);
  }

  function cancelPicking(): void {

  }
</script>
<style lang="scss">

  .nuu-color-selector {
    // It's inline so we don't cover 100% of the width.
    display: inline-flex;
    flex-direction: column;
    padding: 6px;
    border: 1px solid #bbb;
    border-radius: 4px;
    box-shadow: 5px 5px 25px 5px rgba(0,0,0,0.2);
  }

  .color-selector-body {
    display: flex;
    flex-direction: column;
  }

  .color-input-container {
    display: flex;
    flex-direction: column;
    // The RGB circle is otherwise on top of the inputs :D
    margin-top: 16px;
  }

  .color-selector-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
  }
</style>

<div class="nuu-color-selector">
  <div class="color-selector-body">
    <div class="color-picker-container">
      <NuuColorPicker />
    </div>
    <div class="color-input-container">
      <NuuColorInput />
    </div>
  </div>
  <footer class="color-selector-footer">
    <NuuSelectedColor bind:oldHSVAColor="{oldHSVAColor}" />
    <NuuColorConfirm on:ok={selectColor} on:cancel={cancelPicking} />
  </footer>
</div>

