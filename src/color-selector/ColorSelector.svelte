<script lang="ts">
  import ColorPicker from "./ColorPicker.svelte";
  import ColorInput from "./ColorInput.svelte";
  import { toRGBForCSS } from "../helpers/color-space-helpers";

  import { red, green, blue } from './selected-colors.store';

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
    <div class="selected-color" style="background-color: { toRGBForCSS($red, $green, $blue) }"></div>
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

