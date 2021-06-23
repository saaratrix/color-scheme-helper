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

  .color-selector {
    display: inline-flex;
    padding: 0.5rem;
    border: 1px solid black;
    box-shadow: 5px 5px 25px 5px rgba(0,0,0,0.2);
  }
</style>

<div class="color-selector">
  <div class="color-picker-container">
    <ColorPicker />
  </div>
  <div class="color-input-container">
    <ColorInput />
    <div class="color-selector-header">
      <div class="selected-color" style="background-color: { toRGBForCSS($red, $green, $blue) }"></div>
    </div>
  </div>
</div>

