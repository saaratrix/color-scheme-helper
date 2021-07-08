<script lang="ts">
  import ColorSelector from './color-selector/NuuColorSelector.svelte';
  import { isDraggingColor } from './color-selector/color-selector.store';
  import type { ColorHSVA } from './color-selector/models/colors/color-hsva';
  import {
    hsvaToCSS,
    hsvToRGB,
    hsvaToRGBAToCSS,
    rgbaToCSS,
    rgbaToHex
  } from './color-selector/helpers/color-space-helpers';
  import SelectedColors from "./selected-colors/SelectedColors.svelte";
  import type { SelectedColorsColorChangedEvent } from './selected-colors/selected-colors-events';

  isDraggingColor.subscribe((value) => {
    if (value) {
      document.body.classList.add('user-select-none');
    } else {
      document.body.classList.remove('user-select-none');
    }
  });

  let currentColor: string = '';
  function onColorChanged(event: CustomEvent<SelectedColorsColorChangedEvent>): void {
    console.log('color changed', event.detail.color);
    currentColor = event.detail.color;
  }
</script>
<style>

</style>

<main>
  <div class="color-picker-wrapper">
    <ColorSelector bind:color={currentColor} />
  </div>
  <div>
    <SelectedColors on:colorChanged={onColorChanged}></SelectedColors>
  </div>
</main>


