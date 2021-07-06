<script lang="ts">
	import ColorSelector from './color-selector/NuuColorSelector.svelte';
  import { isDraggingColor } from './color-selector/color-selector.store';
  import type { ColorHSVA } from './color-selector/models/colors/color-hsva';
  import { hsvaToCSS, hsvToRGB, hsvToRGBAToCSS, rgbaToCSS, rgbaToHex } from './color-selector/helpers/color-space-helpers';

  isDraggingColor.subscribe((value) => {
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


