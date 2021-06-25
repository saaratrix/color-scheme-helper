<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { drawRGBStrip, drawHSVBlock } from './color-picker-helpers';
  import { hsvToRGBAToCSS } from '../helpers/color-space-helpers';

  import { hue, saturation, value } from './selected-colors.store';
  import { isDragging } from '../global-states.store';
  import type { Unsubscriber } from 'svelte/store';
  import { clamp } from '../helpers/math-helpers';

  let svCanvas: HTMLCanvasElement;
  let svContext: CanvasRenderingContext2D | undefined;
  let svIndicator: HTMLElement | undefined;
  let rgbCanvas: HTMLCanvasElement;
  let rgbContext: CanvasRenderingContext2D | undefined;
  // Indicator to transform up & down based on color!
  let rgbPointyIndicator: HTMLElement | undefined;
  // SVG Path to get the fill
  let rgbPointyPath: SVGPathElement | undefined;

  let svPointerDown: boolean = false;
  let rgbPointerDown: boolean = false;

  const subscriptions: Unsubscriber[] = [];

  onMount((): void => {
    initEvents();

    svContext = svCanvas.getContext('2d');
    rgbContext = rgbCanvas.getContext('2d');

    drawRGBStrip(rgbCanvas);
    drawHSVBlock(hsvToRGBAToCSS($hue, 1, 1), svCanvas);

    subscriptions.push(
      hue.subscribe(h => {
        const rgba = hsvToRGBAToCSS(h, 1, 1);
        drawHSVBlock(rgba, svCanvas);
        const rgbIndicatorTop = (((360 - h) / 360) * rgbCanvas.height);
        rgbPointyIndicator.style.transform = `translateY(${rgbIndicatorTop}px)`;
        rgbPointyPath.style.fill = rgba;
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
  }

  function removeEvents(): void {
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointermove', onPointerMove);
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
$outer-color: rgba(0, 0, 0, 0.67);
$inner-color: rgba(255, 255, 255, 0.8);

$rgb-padding-left: 15px;
$rgb-indicator-outer-bg: #0d0d0d;
$rgb-indicator-inner-bg: seashell;

.color-picker {
  display: flex;
}

.color-picker-sv-container,
.color-picker-rgb-container {
  position: relative;
  display: flex;
}

.color-picker-rgb-container {
  padding-left: $rgb-padding-left;
}

.color-picker-circle-indicator,
.color-picker-inner-circle,
.color-picker-rgb-slider {
  position: absolute;
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
  width: 28px;
  height: 28px;
  // Set the top negative to half height so the transform that will be applied can just be the position!
  top: -14px;
  left: 11px;

  pointer-events: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 0.6;
}

</style>
<div class="color-picker">
    <div class="color-picker-sv-container">
      <div bind:this={svIndicator} class="color-picker-circle-indicator"><div class="color-picker-inner-circle"></div></div>
      <canvas bind:this={svCanvas} on:pointerdown={onSVPointerDown} width="256" height="256" class="color-picker-saturation-lightness"></canvas>
    </div>
    <div class="color-picker-rgb-container">
      <div bind:this={rgbPointyIndicator} class="color-picker-rgb-slider">
        <!-- svg source: https://stackoverflow.com/a/45455766 -->
        <svg viewBox="0 0 10 10">
          <defs>
            <!-- source: https://stackoverflow.com/a/42449363 -->
            <filter id='inset' x='-50%' y='-50%' width='200%' height='200%'>
              <!--outside-stroke-->
              <feFlood flood-color="black" result="outside-color"/>
              <!-- we hide the "outer" border because it's anti-aliased. -->
              <!-- then we render the inside stroke with the stroke attribute. -->
              <feMorphology in="SourceAlpha" operator="dilate" radius="0"/>
              <feComposite in="outside-color" operator="in" result="outside-stroke"/>
              <!--inside-stroke-->
              <feFlood flood-color="rgba(0, 0, 0, 0.67)" result="inside-color"/>
              <feComposite in2="SourceAlpha" operator="in" result="inside-stroke"/>
              <!--fill-area-->
              <feMorphology in="SourceAlpha" operator="erode" radius="0.25"/>
              <feComposite in="SourceGraphic" operator="in" result="fill-area"/>
              <!--merge graphics-->
              <feMerge>
                <feMergeNode in="outside-stroke"/>
                <feMergeNode in="inside-stroke"/>
                <feMergeNode in="fill-area"/>
              </feMerge>
            </filter>
          </defs>
          <path bind:this={rgbPointyPath} fill="red" d="M5 1 Q5.8 4.2 9 5 Q5.8 5.8 5 9 Q4.2 5.8 1 5 Q4.2 4.2 5 1z" filter="url(#inset)"></path>
        </svg>
      </div>
      <canvas bind:this={rgbCanvas} on:pointerdown={onRGBPointerDown} class="color-picker-rgb" width="20" height="256"></canvas>
    </div>
</div>
