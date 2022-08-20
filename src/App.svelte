<script lang="ts">
  import ColorSelector from './color-selector/NuuColorSelector.svelte';
  import { isDraggingColor } from './color-selector/color-selector.store';
  import type { ColorSwatchColorChangedEvent } from './color-swatch/color-swatch-events';
  import ColorSwatch from "./color-swatch/ColorSwatch.svelte";
  import type { NuuColorSelectorEvents } from './color-selector/models/events/nuu-color-selector-events';
  import ColorThemer from "./complementary-colours/ColorThemer.svelte";

  isDraggingColor.subscribe((value) => {
    if (value) {
      document.body.classList.add('user-select-none');
    } else {
      document.body.classList.remove('user-select-none');
    }
  });

  let currentColor: string = '';
  let pickedColor: string = '';

  function onColorPicked(event: CustomEvent<NuuColorSelectorEvents>): void {
    pickedColor = event.detail as string;
  }

  function onColorChanged(event: CustomEvent<ColorSwatchColorChangedEvent>): void {
    currentColor = event.detail.color;
  }
</script>
<style>
.color-swatch-wrapper {
  margin-top: 12px;
}
</style>

<main>
  <div class="color-picker-wrapper">
    <ColorSelector bind:color={currentColor} on:colorPicked={onColorPicked} />
  </div>
  <div class="color-swatch-wrapper">
    <ColorSwatch on:colorChanged={onColorChanged} bind:pickedColor={pickedColor} />
  </div>
  <div class="related-colours-wrapper">
    <ColorThemer />
  </div>
</main>


