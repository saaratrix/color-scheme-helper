<script lang="ts">
  import { r, g, b } from './selected-colors.store';

  setInterval(() => {
    let value = $r + 1;
    value = value % 255;
    r.set(value);
  }, 10);
</script>

<div>
  <div class="input-group">
    <label>h: </label>
    <input type="number" name="h">
    <br>
    <label>s: </label>
    <input type="number" name="s">
    <br>
    <label>l: </label>
    <input type="number" name="l">
  </div>
  <div class="input-group">
    <label>r: </label>
    <input value={$r} name="r" type="number" step="1" min="0" max="255">
    <br>
    <label>g: </label>
    <input value={$g} name="g" type="number" step="1" min="0" max="255">
    <br>
    <label>b: </label>
    <input value={$b} name="b" type="number" step="1" min="0" max="255">
    <label>HEX: </label>
    <input name="hex" type="text" maxlength="9">
  </div>
</div>
