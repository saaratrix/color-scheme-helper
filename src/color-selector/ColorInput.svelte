<script lang="ts">
  import { red, green, blue, hue, saturation, value } from './selected-colors.store';
</script>

<div>
  <div class="input-group">
    <label>h: </label>
    <input name="h" value={$hue} type="number" step="1" min="0" max="360">
    <br>
    <label>s: </label>
    <input name="s" value={Math.round($saturation * 100)} type="number" step="1" min="0" max="100">
    <br>
    <label>v: </label>
    <input name="v" value={Math.round($value * 100)} type="number" step="1" min="0" max="100">
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
