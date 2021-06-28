<script lang="ts">
  import ColorPicker from "./ColorPicker.svelte";
  import ColorInput from "./ColorInput.svelte";
  import NuuSelectedColor from "./NuuSelectedColor.svelte";
  import { hue, saturation, value } from './selected-colors.store';
  import { ColorHSV } from '../models/color-hsv';

  let oldHSVColor: ColorHSV = {
    hue: Math.round(Math.random() * 360),
    saturation: Math.random(),
    value: Math.random(),
  }

  function selectColor(): void {
    oldHSVColor.hue = $hue;
    oldHSVColor.saturation = $saturation;
    oldHSVColor.value = $value;
  }
</script>
<style lang="scss">

  .color-selector {
    display: inline-flex;
    padding: 8px;
    border: 1px solid #bbb;
    border-radius: 4px;
    box-shadow: 5px 5px 25px 5px rgba(0,0,0,0.2);
  }

  .color-input-container {
    display: grid;
    grid-gap: 6px;
    padding: 0 4px;
  }

  .color-selected-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .selected-color-container {
    // This also removes whitespace which adds 4 pixels to the height.
    display: flex;
  }

  .color-confirm-button {
    display: inline-block;
    padding: 0 4px;
    font-weight: bold;
    font-size: 16pt;
    color: green;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: lime;
    }

    &:active {
      color: #ac73bc;
    }
  }
</style>

<div class="color-selector">
  <div class="color-picker-container">
    <ColorPicker />
  </div>
  <div class="color-input-container">
    <ColorInput />
    <div class="color-selected-container">
      <div class="selected-color-container">
        <NuuSelectedColor oldHSVColor="{oldHSVColor}" />
      </div>
      <div class="color-confirm" on:click={selectColor}><span class="color-confirm-button" title="OK!">✓</span></div>
    </div>
  </div>
</div>

