<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock } from './color-picker-helpers';
  import { hsvToRGB, hsvToRGBAForCSS } from '../helpers/color-space-helpers';

  import { red, green, blue, hue, saturation, value } from './selected-colors.store';
  import type { Unsubscriber } from 'svelte/store';
  import { clamp } from '../helpers/math-helpers';

  let svCanvas: HTMLCanvasElement;
  let svContext: CanvasRenderingContext2D | undefined;
  let rgbCanvas: HTMLCanvasElement;
  let rgbContext: CanvasRenderingContext2D | undefined;

  let svPointerDown: boolean = false;
  let rgbPointerDown: boolean = false;

  const subscriptions: Unsubscriber[] = [];

  onMount((): void => {
    initEvents();

    svContext = svCanvas.getContext('2d');
    rgbContext = rgbCanvas.getContext('2d');

    drawRGBStrip(rgbCanvas);
    drawHSVBlock(hsvToRGBAForCSS($hue, 1, 1), svCanvas);

    subscriptions.push(
      hue.subscribe(value => {
        drawHSVBlock(hsvToRGBAForCSS($hue, 1, 1), svCanvas);
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

    svCanvas.addEventListener('pointerdown', onSVPointerDown);
    rgbCanvas.addEventListener('pointerdown', onRGBPointerDown);
  }

  function removeEvents(): void {
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointermove', onPointerMove);

    svCanvas.removeEventListener('pointerdown', onSVPointerDown);
    rgbCanvas.removeEventListener('pointerdown', onRGBPointerDown);
  }

  function onPointerMove(event: PointerEvent): void {
    onSLPointerMove(event);
    onRGBPointerMove(event);
  }

  function onPointerUp(): void {
    svPointerDown = false;
    rgbPointerDown = false;
  }

  function onPointerLeave(): void {
    rgbPointerDown = false;
    svPointerDown = false;
  }

  function onSVPointerDown(): void {
    svPointerDown = true;
  }

  function onRGBPointerDown(): void {
    rgbPointerDown = true;
  }

  function onSLPointerMove(event: PointerEvent): void {
    if (!svPointerDown) {
      return;
    }

    const bounds = svCanvas.getBoundingClientRect();
    const x = clamp(event.clientX - bounds.left, 0, svCanvas.width);
    const y = clamp(event.clientY - bounds.top, 0, svCanvas.height);

    const s = x / svCanvas.width;
    const v = 1 - (y / svCanvas.height);

    saturation.set(s);
    value.set(v);

    const rgb = hsvToRGB($hue, $saturation, $value);
    red.set(rgb.red);
    green.set(rgb.green);
    blue.set(rgb.blue);
  }

  function onRGBPointerMove(event: PointerEvent): void {
    if (!rgbPointerDown) {
      return;
    }

    const bounds = rgbCanvas.getBoundingClientRect();
    // Get y-pos within the canvas.
    const y = clamp(event.clientY - bounds.top, 0, rgbCanvas.height);
    // Because the top is 360 degrees we want the top to be 360 degrees and bottom 0 degrees.
    // So 360 - value!
    const h = 360 - Math.round(((y / rgbCanvas.height) * 360));
    hue.set(h);

    const rgb = hsvToRGB($hue, $saturation, $value);
    red.set(rgb.red);
    green.set(rgb.green);
    blue.set(rgb.blue);
  }
</script>
<style lang="scss">
.color-picker-saturation-lightness-container,
.color-picker-rgb-container {
  position: relative;
}

</style>
<div class="color-picker">
    <div class="color-picker-saturation-lightness-container">
        <canvas bind:this={svCanvas} class="color-picker-saturation-lightness"></canvas>
    </div>
    <div class="color-picker-rgb-container">
        <canvas bind:this={rgbCanvas} class="color-picker-rgb" width="20" height="256"></canvas>
    </div>
</div>
