<script lang="ts">
  import { onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock } from './color-picker-helpers';

  let slCanvas: HTMLCanvasElement;
  let rgbCanvas: HTMLCanvasElement;

  onMount(() => {
    drawRGBStrip(rgbCanvas);
    drawHSVBlock('rgba(255, 0, 0, 1)', slCanvas);
  });
</script>
<style lang="scss">
.color-picker-saturation-lightness-container,
.color-picker-rgb-container {
  position: relative;
}
</style>
<div class="color-picker">
    <div class="color-picker-saturation-lightness-container">
        <canvas bind:this={slCanvas} class="color-picker-saturation-lightness"></canvas>
    </div>
    <div class="color-picker-rgb-container">
        <canvas bind:this={rgbCanvas} class="color-picker-rgb"></canvas>
    </div>
</div>
