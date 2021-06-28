<script lang="ts">
  import { hsvToCSS } from '../helpers/color-space-helpers';
  import type { ColorHSV } from '../models/color-hsv';
  import { onMount } from 'svelte';
  import { hue, saturation, value } from './selected-colors.store';

  export let oldHSVColor: ColorHSV;

  onMount(() => {
    // Set the color to the input color.
    resetColor();
  });

  function resetColor(): void {
    hue.set(oldHSVColor.hue);
    saturation.set(oldHSVColor.saturation);
    value.set(oldHSVColor.value);
  }
</script>
<style lang="scss">
  $selected-color-height: 32px;
  $selected-color-width: 44px;

  .selected-color {
    display: inline-block;
    width: $selected-color-width;
    height: $selected-color-height;
  }

  .selected-color-old {
    cursor: pointer;
  }
</style>

<div class="selected-color selected-color-new" style="background-color: { hsvToCSS($hue, $saturation, $value) }"></div>
<div class="selected-color selected-color-old" on:click={resetColor} style="background-color: { hsvToCSS(oldHSVColor.hue, oldHSVColor.saturation, oldHSVColor.value) }"></div>
