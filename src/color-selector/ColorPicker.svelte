<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock } from './color-picker-helpers';
  import { toRGBAforCSS } from '../helpers/color-space-helpers';

  import { r, g, b } from './selected-colors.store';
  import type { Unsubscriber } from 'svelte/store';

  let slCanvas: HTMLCanvasElement;
  let slContext: CanvasRenderingContext2D | undefined;
  let rgbCanvas: HTMLCanvasElement;
  let rgbContext: CanvasRenderingContext2D | undefined;

  let slPointerDown: boolean = false;
  let rgbPointerDown: boolean = false;

  const subscriptions: Unsubscriber[] = [];

  onMount((): void => {
    initEvents();

    slContext = slCanvas.getContext('2d');
    rgbContext = slCanvas.getContext('2d');

    drawRGBStrip(rgbCanvas);
    drawHSVBlock(toRGBAforCSS($r, $g, $b, 1), slCanvas);

    subscriptions.push(
      r.subscribe(value => {
        drawHSVBlock(toRGBAforCSS($r, $g, $b, 1), slCanvas);
      }),
      g.subscribe(value => {
        drawHSVBlock(toRGBAforCSS($r, $g, $b, 1), slCanvas);
      }),
      b.subscribe(value => {
        drawHSVBlock(toRGBAforCSS($r, $g, $b, 1), slCanvas);
      }),
    );
  });

  onDestroy((): void => {
    for (const subscription of subscriptions) {
      subscription();
    }

    removeEvents();
  });

  function initEvents(): void {
    window.addEventListener('pointerleave', onWindowPointerLeave);
    window.addEventListener('pointerup', onWindowPointerUp);

    rgbCanvas.addEventListener('pointerdown', onRGBPointerDown);
    rgbCanvas.addEventListener('pointermove', onRGBPointerMove);
  }

  function removeEvents(): void {

  }

  function onRGBPointerDown(): void {
    rgbPointerDown = true;
  }

  function onRGBPointerMove(event: PointerEvent): void {
    if (!rgbPointerDown) {
      return;
    }

    const imageData = rgbContext.getImageData(event.clientX, event.clientY, 1, 1);
    console.log('pixel data!', imageData);
  }

  function onWindowPointerUp(): void {
    rgbPointerDown = false;
    slPointerDown = false;
  }

  function onWindowPointerLeave(): void {
    rgbPointerDown = false;
    slPointerDown = false;
  }
</script>
<style lang="scss">
.color-picker-saturation-lightness-container,
.color-picker-rgb-container {
  position: relative;
}

canvas {
  cursor: crosshair;
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
