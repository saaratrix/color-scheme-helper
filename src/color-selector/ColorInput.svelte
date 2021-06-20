<script lang="ts">
  import { red, green, blue, hue } from './selected-colors.store';
</script>

<div>
  <div class="input-group">
    <label>h: </label>
    <input name="h" value={$hue} type="number" step="1" min="0" max="359">
    <br>
    <label>s: </label>
    <input name="s" type="number">
    <br>
    <label>l: </label>
    <input name="l" type="number">
  </div>
  <div class="input-group">
    <label>r: </label>
    <input name="r" value={$red} type="number" step="1" min="0" max="255">
    <br>
    <label>g: </label>
    <input name="g" value={$green} type="number" step="1" min="0" max="255">
    <br>
    <label>b: </label>
    <input name="b" value={$blue} type="number" step="1" min="0" max="255">
    <label>HEX: </label>
    <input name="hex" type="text" maxlength="9">
  </div>
</div>
