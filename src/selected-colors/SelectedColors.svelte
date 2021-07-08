<script lang="ts">
  import type { ColorHSVA } from '../color-selector/models/colors/color-hsva';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { SelectedColorsEvents } from './selected-colors-events';
  import { hsvToRGB, rgbaToHex } from '../color-selector/helpers/color-space-helpers';

  const dispatch = createEventDispatcher<SelectedColorsEvents>();

  let currentIndex = 0;
  let colors: ColorHSVA[] = [];

  onMount(() => {
    initColors();
    dispatchColorChanged();
  });

  function initColors(): void {
    const totalColors = 16;
    colors.push({
      hue: Math.round(Math.random() * 360),
      saturation: Math.random(),
      value: Math.random(),
      alpha: 1,
    });

    for (let i = 0; i < totalColors - 1; i++) {
      // Add a lot of white colours!
      colors.push({
        hue: 360,
        saturation: 0,
        value: 1,
        alpha: 1,
      });
    }
  }

  function dispatchColorChanged(): void {
    const color = colors[currentIndex];
    const rgb = hsvToRGB(color.hue, color.saturation, color.value);
    const hex = rgbaToHex(rgb.red, rgb.green, rgb.blue, color.alpha, true);
    dispatch('colorChanged', {
      color: hex,
    });
  }
</script>
<style lang="scss">

</style>

<div class="selected-colors"></div>
