<script lang="ts">
  import ColorPicker from "./ColorPicker.svelte";
  import ColorInput from "./ColorInput.svelte";
  import { toRGBforCSS } from "../helpers/color-space-helpers";

  import { r, g, b } from './selected-colors.store';

</script>
<style lang="scss">
  $size-selected-color: 64px;

  .selected-color {
    display: inline-block;
    width: $size-selected-color;
    height: $size-selected-color;
  }
</style>

<section>
  <header class="color-selector-header">
    <div class="selected-color" style="background-color: { toRGBforCSS($r, $g, $b) }"></div>
  </header>
  <main>
    <div class="color-picker-container">
      <ColorPicker />
    </div>
    <div class="color-input-container">
      <ColorInput />
    </div>
  </main>

</section>

