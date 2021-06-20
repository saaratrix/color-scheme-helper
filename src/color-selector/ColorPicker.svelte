<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock } from './color-picker-helpers';
  import { getHueFromRGB, toRGBAforCSS } from '../helpers/color-space-helpers';

  import { red, green, blue, hue } from './selected-colors.store';
  import type { Unsubscriber } from 'svelte/store';
  import { clamp } from '../helpers/math-helpers';

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
    rgbContext = rgbCanvas.getContext('2d');

    drawRGBStrip(rgbCanvas);
    drawHSVBlock(toRGBAforCSS($red, $green, $blue, 1), slCanvas);

    subscriptions.push(
      red.subscribe(value => {
        drawHSVBlock(toRGBAforCSS($red, $green, $blue, 1), slCanvas);
      }),
      green.subscribe(value => {
        drawHSVBlock(toRGBAforCSS($red, $green, $blue, 1), slCanvas);
      }),
      blue.subscribe(value => {
        drawHSVBlock(toRGBAforCSS($red, $green, $blue, 1), slCanvas);
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
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    rgbCanvas.addEventListener('pointerdown', onRGBPointerDown);
  }

  function removeEvents(): void {
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointermove', onPointerMove);

    rgbCanvas.removeEventListener('pointerdown', onRGBPointerDown);
  }

  function onPointerMove(event: PointerEvent): void {
    onRGBPointerMove(event);
  }

  function onPointerUp(): void {
    slPointerDown = false;
    rgbPointerDown = false;
  }

  function onPointerLeave(): void {
    rgbPointerDown = false;
    slPointerDown = false;
  }

  function onRGBPointerDown(): void {
    rgbPointerDown = true;
  }

  function onRGBPointerMove(event: PointerEvent): void {
    if (!rgbPointerDown) {
      return;
    }

    const bounds = rgbCanvas.getBoundingClientRect();

    const y = clamp(event.clientY - bounds.top, 0, rgbCanvas.height - 1);
    const imageData = rgbContext.getImageData(0, y, 1, 1);

    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];

    const h = getHueFromRGB(r, g, b);
    hue.set(h);

    red.set(r);
    green.set(g);
    blue.set(b);
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
        <canvas bind:this={rgbCanvas} class="color-picker-rgb" width="20" height="256"></canvas>
    </div>
</div>
