<script lang="ts">
  import { hsvaToCSS } from './helpers/color-space-helpers';
  import { onDestroy, onMount } from 'svelte';
  import { hue, saturation, value, alpha } from './color-selector.store';
  import type { ColorHSVA } from './models/colors/color-hsva';
  import type { Unsubscriber } from 'svelte/store';
  import { drawAlphaBackground } from './helpers/color-picker-helpers';

  export let oldHSVAColor: ColorHSVA;
  // If oldHSVAColor changes then we want to draw new color! This can be changed if a user confirms their colour selection.
  $: if (oldHSVAColor) { drawColor(oldContext, oldHSVAColor.hue, oldHSVAColor.saturation, oldHSVAColor.value, oldHSVAColor.alpha); };

  const canvasWidth = 32;
  const canvasHeight = 32;

  let newCanvas: HTMLCanvasElement | undefined;
  let newContext: CanvasRenderingContext2D | undefined;

  let oldCanvas: HTMLCanvasElement | undefined;
  let oldContext: CanvasRenderingContext2D | undefined;

  let subscriptions: Unsubscriber[] = [];

  onMount(() => {
    newContext = newCanvas.getContext('2d');
    oldContext = oldCanvas.getContext('2d');
    // Set the color to the input color.
    resetColor();
    drawColor(newContext, $hue, $saturation, $value, $alpha);

    subscriptions.push(
      hue.subscribe((h) => {
        drawColor(newContext, h, $saturation, $value, $alpha);
      }),
      saturation.subscribe(s => {
        drawColor(newContext, $hue, s, $value, $alpha);
      }),
      value.subscribe(v => {
        drawColor(newContext, $hue, $saturation, v, $alpha);
      }),
      alpha.subscribe(a => {
        drawColor(newContext, $hue, $saturation, $value,a);
      }),
    );
  });

  onDestroy(() => {
    for (const subscription of subscriptions) {
      subscription();
    }
  });

  function drawColor(context: CanvasRenderingContext2D, h: number, s: number, v: number, a: number): void {
    if (!context) {
      return;
    }

    if (a < 1) {
      // Draw alpha background!
      drawAlphaBackground(canvasWidth, canvasHeight, context);
    } else {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    const css = hsvaToCSS(h, s, v, a);
    context.fillStyle = css;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  function resetColor(): void {
    hue.set(oldHSVAColor.hue);
    saturation.set(oldHSVAColor.saturation);
    value.set(oldHSVAColor.value);
    alpha.set(oldHSVAColor.alpha);
  }
</script>
<style lang="scss">
  $selected-color-height: 32px;
  $selected-color-width: 32px;

  .nuu-selected-color {
    // This also removes whitespace which adds 4 pixels to the height.
    display: inline-flex;
  }

  .selected-color-inner-container {
    display: inline-flex;
    border: 1px solid rgba(0, 0, 0, 0.67);
    height: $selected-color-height + 2px;
  }

  .selected-color {
    display: inline-block;
    width: $selected-color-width;
    height: $selected-color-height;
  }

  .selected-color-old {
    cursor: pointer;
  }
</style>
<div class="nuu-selected-color">
  <div class="selected-color-inner-container">
    <div class="selected-color selected-color-new"><canvas bind:this={newCanvas} width={canvasWidth} height={canvasHeight}></canvas></div>
    <div class="selected-color selected-color-old" on:click={resetColor}><canvas bind:this={oldCanvas} width={canvasWidth} height={canvasHeight}></canvas></div>
  </div>
</div>

