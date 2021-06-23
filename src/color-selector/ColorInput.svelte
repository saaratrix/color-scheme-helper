<script lang="ts">
  import { red, green, blue, hue, saturation, value } from './selected-colors.store';
</script>
<style lang="scss">
  .color-input-container {
    display: grid;
    grid-gap: 0.5rem;
    padding: 0.2857rem;
  }

  .color-group {
    display: grid;
    grid-gap: 0.25rem;
  }

  label {
    display: inline-block;
    width: 2rem;
    text-align:right;
  }

  input {
    width: 5.5rem;
    padding: 0.25rem;
    text-align: right;
  }

  // Hide the arrows for a number.
  // Source: https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
</style>

<div class="color-input-container">
  <div class="color-group">
    <div class="input-group">
      <label>H: </label>
      <input name="h" value={$hue} type="number" step="1" min="0" max="360">
    </div>
    <div class="input-group">
      <label>S: </label>
      <input name="s" value={Math.round($saturation * 100)} type="number" step="1" min="0" max="100">
    </div>
    <div class="input-group">
      <label>V: </label>
      <input name="v" value={Math.round($value * 100)} type="number" step="1" min="0" max="100">
    </div>
  </div>
  <div class="color-group">
    <div class="input-group">
      <label>R: </label>
      <input name="r" value={$red} type="number" step="1" min="0" max="255">
    </div>
    <div class="input-group">
      <label>G: </label>
      <input name="g" value={$green} type="number" step="1" min="0" max="255">
    </div>
    <div class="input-group">
      <label>B: </label>
      <input name="b" value={$blue} type="number" step="1" min="0" max="255">
    </div>
    <div class="input-group">
      <label>HEX: </label>
      <input name="hex" type="text" maxlength="9">
    </div>
  </div>
</div>
