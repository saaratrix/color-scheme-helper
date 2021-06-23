<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock } from './color-picker-helpers';
  import { hsvToRGB, hsvToRGBAForCSS } from '../helpers/color-space-helpers';

  import { red, green, blue, hue, saturation, value } from './selected-colors.store';
  import { isDragging } from '../global-states.store';
  import type { Unsubscriber } from 'svelte/store';
  import { clamp } from '../helpers/math-helpers';

  let svCanvas: HTMLCanvasElement;
  let svContext: CanvasRenderingContext2D | undefined;
  let svIndicator: HTMLElement | undefined;
  let rgbCanvas: HTMLCanvasElement;
  let rgbContext: CanvasRenderingContext2D | undefined;
  let rgbIndicator: HTMLElement | undefined;

  let svPointerDown: boolean = false;
  let rgbPointerDown: boolean = false;

  // -3 is eyeballed to be center!
  const hueIndicatorTopOffset: number = -3;

  const subscriptions: Unsubscriber[] = [];

  onMount((): void => {
    initEvents();

    svContext = svCanvas.getContext('2d');
    rgbContext = rgbCanvas.getContext('2d');

    drawRGBStrip(rgbCanvas);
    drawHSVBlock(hsvToRGBAForCSS($hue, 1, 1), svCanvas);

    subscriptions.push(
      hue.subscribe(h => {
        drawHSVBlock(hsvToRGBAForCSS(h, 1, 1), svCanvas);
        const rgbIndicatorTop = (((360 - h) / 360) * rgbCanvas.height) + hueIndicatorTopOffset;
        rgbIndicator.style.transform = `translateY(${rgbIndicatorTop}px)`;
      }),
      saturation.subscribe(s => {
        svIndicator.style.transform = getSVIndicatorTransform(s, $value);
      }),
      value.subscribe(v => {
        svIndicator.style.transform = getSVIndicatorTransform($saturation, v);
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
    if (svPointerDown) {
      isDragging.removeDragging();
    }
    if (rgbPointerDown) {
      isDragging.removeDragging();
    }

    svPointerDown = false;
    rgbPointerDown = false;
  }

  function onPointerLeave(): void {
    onPointerUp();
  }

  function onSVPointerDown(event: PointerEvent): void {
    svPointerDown = true;
    onSLPointerMove(event);
    isDragging.addDragging();
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

  function onRGBPointerDown(event: PointerEvent): void {
    rgbPointerDown = true;
    onRGBPointerMove(event);
    isDragging.addDragging();
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

  function getSVIndicatorTransform(saturation: number, value: number): string {
    const x = (saturation * svCanvas.width) - svIndicator.offsetWidth * 0.5;
    const y = ((1 - value) * svCanvas.height) - svIndicator.offsetHeight * 0.5;
    const transform = `translate(${x}px, ${y}px)`;
    return transform;
  }
</script>
<style lang="scss">
$circle-radius: 10px;
$outer-color: rgba(0, 0, 0, 0.33);
$inner-color: rgba(255, 255, 255, 0.8);

$rgb-padding-left: 15px;
$arrow-indicator-size: 7px;
$arrow-indicator-position-left: $rgb-padding-left - $arrow-indicator-size;
$arrow-indicator-outer-bg: #0d0d0d;
$arrow-indicator-inner-bg: seashell;

.color-picker {
  display: flex;
}

.color-picker-sv-container,
.color-picker-rgb-container {
  position: relative;
}

.color-picker-rgb-container {
  padding-left: $rgb-padding-left;
}

.color-picker-arrow-indicator,
.color-picker-inner-arrow,
.color-picker-circle-indicator,
.color-picker-inner-circle {
  position: absolute;
}

.color-picker-arrow-indicator {
  left: $arrow-indicator-position-left;
  width: 0;
  height: 0;
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-left: $arrow-indicator-size solid $arrow-indicator-outer-bg;
}

.color-picker-inner-arrow {
  width: 0;
  height: 0;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  border-left: 5px solid $arrow-indicator-inner-bg;
  // -7px is too much, -6px is ok but -6.5px seems to do best!
  left: -6.5px;
  top: -2px;
}

.color-picker-circle-indicator {
  width: $circle-radius;
  height: $circle-radius;
  border: 1px solid $outer-color;
  border-radius: $circle-radius;
}

.color-picker-inner-circle {
  width: 100%;
  height: 100%;
  border: 1px solid $inner-color;
  border-radius: $circle-radius;
}

</style>
<div class="color-picker">
    <div class="color-picker-sv-container">
      <div bind:this={svIndicator} class="color-picker-circle-indicator"><div class="color-picker-inner-circle"></div></div>
      <canvas bind:this={svCanvas} width="256" height="256" class="color-picker-saturation-lightness"></canvas>
    </div>
    <div class="color-picker-rgb-container">
      <div bind:this={rgbIndicator} class="color-picker-arrow-indicator"><div class="color-picker-inner-arrow"></div></div>
      <canvas bind:this={rgbCanvas} class="color-picker-rgb" width="20" height="256"></canvas>
    </div>
</div>
