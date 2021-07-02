<script lang="ts">
	import ColorSelector from './color-selector/ColorSelector.svelte';
  import { isDragging } from './global-states.store';
  import type { ColorHSVA } from './models/color-hsva';
  import { hsvaToCSS, hsvToRGB, hsvToRGBAToCSS, rgbaToCSS, rgbaToHex } from './helpers/color-space-helpers';

  isDragging.subscribe((value) => {
    if (value) {
      document.body.classList.add('user-select-none');
    } else {
      document.body.classList.remove('user-select-none');
    }
  });

  let colorHSVA: ColorHSVA = {
    hue: Math.round(Math.random() * 360),
    saturation: Math.random(),
    value: Math.random(),
    alpha: 1,
  };
  let color: string = hsvaToCSS(colorHSVA.hue, colorHSVA.saturation, colorHSVA.value, colorHSVA.alpha);
</script>
<style>

</style>

<main>
	<ColorSelector bind:color={color} />
</main>


