<script lang="ts">
  import ColorPicker from "./ColorPicker.svelte";
  import ColorInput from "./ColorInput.svelte";
  import { rgbToCSS, hsvToCSS } from "../helpers/color-space-helpers";

  import { hue, saturation, value } from './selected-colors.store';

</script>
<style lang="scss">
  $selected-color-height: 32px;
  $selected-color-width: 2.75rem;

  .color-selector {
    display: inline-flex;
    padding: 0.5rem;
    border: 1px solid black;
    box-shadow: 5px 5px 25px 5px rgba(0,0,0,0.2);
  }

  .color-input-selected-container {
    display: grid;
    grid-gap: 0.4rem;
    padding: 0 0.25rem;
  }

  .selected-color-container {
    // This also removes whitespace which adds 4 pixels to the height.
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .selected-color {
    display: inline-block;
    width: $selected-color-width;
    height: $selected-color-height;
  }
</style>

<div class="color-selector">
  <div class="color-picker-container">
    <ColorPicker />
  </div>
  <div class="color-input-selected-container">
    <ColorInput />
    <div class="selected-color-container">
      <div class="selected-color selected-color-new" style="background-color: { hsvToCSS($hue, $saturation, $value) }"></div>
      <div class="selected-color selected-color-old" style="background-color: { rgbToCSS(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)) }"></div>
    </div>
  </div>
</div>

