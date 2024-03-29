<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock, createHSVGradients } from './helpers/color-picker-helpers';
  import { hsvaToRGBAToCSS } from './helpers/color-space-helpers';

  import { hue, saturation, value, isDraggingColor } from './color-selector.store';
  import type { Unsubscriber } from 'svelte/store';
  import { clamp } from './helpers/math-helpers';
  import type { ColorGradients } from './models/colors/color-gradients';

  const svCanvasSize: number = 192;
  // We get the height from the saturation & value canvas size.
  const rgbCanvasWidth: number = 20;

  let svCanvas: HTMLCanvasElement;
  let svContext: CanvasRenderingContext2D | undefined;
  let svGradients: ColorGradients;
  let svIndicator: HTMLElement | undefined;
  let rgbCanvas: HTMLCanvasElement;
  // Indicator to transform up & down based on color!
  let rgbPointyIndicator: HTMLElement | undefined;

  let svPointerDown: boolean = false;
  let rgbPointerDown: boolean = false;

  const subscriptions: Unsubscriber[] = [];
  // Temporary saturation blocker, the event system should be rewritten to be hsva.subscribe() instead of each individual component.
  // but this halves the amount of DOM repaints.
  let tempSaturationBlocker: boolean = false;

  onMount((): void => {
    initEvents();

    svContext = svCanvas.getContext('2d');
    svGradients = createHSVGradients(svCanvas.width, svCanvas.height, svContext);

    drawRGBStrip(rgbCanvas);
    drawHSVBlock(hsvaToRGBAToCSS($hue, 1, 1, 1), svCanvas, svContext, svGradients);

    subscriptions.push(
      hue.subscribe(h => {
        const rgba = hsvaToRGBAToCSS(h, 1, 1, 1);
        drawHSVBlock(rgba, svCanvas, svContext, svGradients);
        const rgbIndicatorTop = (((360 - h) / 360) * rgbCanvas.offsetHeight);
        rgbPointyIndicator.style.transform = `translate(-0.5px, ${rgbIndicatorTop}px)`;
        rgbPointyIndicator.style.backgroundColor = rgba;
      }),
      saturation.subscribe(s => {
        if (tempSaturationBlocker) {
          return;
        }

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
    // TODO: Might want to add an option to confine this only to the color picker in case the user has an app that eats events.
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
  }

  function removeEvents(): void {
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointermove', onPointerMove);
  }

  function onPointerMove(event: PointerEvent): void {
    onSVPointerMove(event);
    onRGBPointerMove(event);
  }

  function onPointerUp(): void {
    if (svPointerDown) {
      isDraggingColor.removeDragging();
    }
    if (rgbPointerDown) {
      isDraggingColor.removeDragging();
    }

    svPointerDown = false;
    rgbPointerDown = false;
  }

  function onPointerLeave(): void {
    onPointerUp();
  }

  function onSVPointerDown(event: PointerEvent): void {
    svPointerDown = true;
    onSVPointerMove(event);
    isDraggingColor.addDragging();
  }

  function onSVPointerMove(event: PointerEvent): void {
    if (!svPointerDown) {
      return;
    }

    const bounds = svCanvas.getBoundingClientRect();
    const x = clamp(event.clientX - bounds.left, 0, svCanvas.offsetWidth);
    const y = clamp(event.clientY - bounds.top, 0, svCanvas.offsetHeight);

    const s = x / svCanvas.offsetWidth;
    const v = 1 - (y / svCanvas.offsetHeight);

    // If v === $value then saturation would never update because the event is never fired that value has changed.
    // A hack for a hack to improve performance!!
    tempSaturationBlocker = v !== $value;
    saturation.set(s);
    value.set(v);
    tempSaturationBlocker = false;
  }

  function onRGBPointerDown(event: PointerEvent): void {
    rgbPointerDown = true;
    onRGBPointerMove(event);
    isDraggingColor.addDragging();
  }

  function onRGBPointerMove(event: PointerEvent): void {
    if (!rgbPointerDown) {
      return;
    }

    const bounds = rgbCanvas.getBoundingClientRect();
    // Get y-pos within the canvas.
    const y = clamp(event.clientY - bounds.top, 0, rgbCanvas.offsetHeight);
    // Because the top is 360 degrees we want the top to be 360 degrees and bottom 0 degrees.
    // So 360 - value!
    const h = 360 - Math.round(((y / rgbCanvas.offsetHeight) * 360));
    hue.set(h);
  }

  function getSVIndicatorTransform(saturation: number, value: number): string {
    const x = (saturation * svCanvas.offsetWidth) - svIndicator.offsetWidth * 0.5;
    const y = ((1 - value) * svCanvas.offsetHeight) - svIndicator.offsetHeight * 0.5;
    const transform = `translate(${x}px, ${y}px)`;
    return transform;
  }
</script>
<style lang="scss">
$circle-radius: 10px;
$outer-color: rgba(0, 0, 0, 0.67);
$inner-color: rgba(255, 255, 255, 0.8);

$rgb-margin-left: 8px;
$rgb-indicator-outer-bg: #0d0d0d;
$rgb-indicator-inner-bg: seashell;

.nuu-color-picker {
  display: flex;
}

.color-picker-sv-container,
.color-picker-rgb-container {
  position: relative;
  display: flex;
}

.color-picker-rgb-container {
  margin-left: $rgb-margin-left;
}

.color-picker-circle-indicator,
.color-picker-inner-circle,
.color-picker-rgb-slider,
.color-picker-rgb-slider-inner {
  position: absolute;
  // We only listen to the
  pointer-events: none;
}

.color-picker-saturation-lightness,
.color-picker-rgb {
  cursor: pointer;
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

.color-picker-rgb-slider {
  width: 25px;
  height: 25px;

  // Set the top negative to half height so the transform that will be applied can just be the position!
  top: -12.5px;
  left: -2.5px;

  pointer-events: none;
  border: 2px solid $outer-color;
  border-radius: 12.5px;
}

.color-picker-rgb-slider-inner {
  width: 100%;
  height: 100%;
  border: 1px solid $inner-color;
  border-radius: 12.5px;
}

</style>
<div class="nuu-color-picker">
    <div class="color-picker-sv-container">
      <div bind:this={svIndicator} class="color-picker-circle-indicator"><div class="color-picker-inner-circle"></div></div>
      <canvas bind:this={svCanvas} on:pointerdown={onSVPointerDown} width={svCanvasSize} height={svCanvasSize} class="color-picker-saturation-lightness"></canvas>
    </div>
    <div class="color-picker-rgb-container">
      <div bind:this={rgbPointyIndicator} class="color-picker-rgb-slider"><div class="color-picker-rgb-slider-inner"></div></div>
      <canvas bind:this={rgbCanvas} on:pointerdown={onRGBPointerDown} class="color-picker-rgb" width={rgbCanvasWidth} height={svCanvasSize}></canvas>
    </div>
</div>
