<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import type { ColorSwatchEvents } from './color-swatch-events';
  import { hsvToRGB, rgbaToHex } from '../color-selector/helpers/color-space-helpers';

  export let pickedColor: string;
  $: pickedColor, updateCurrentColor();

  const dispatch = createEventDispatcher<ColorSwatchEvents>();

  let currentIndex = 0;
  let colors: string[] = [];
  let degrees: number = 0;
  let degreesTimeout: ReturnType<typeof setInterval>;

  onMount(() => {
    initColors();
    dispatchColorChanged();

    const degreesPerSecond = 360 / 30;
    // The lazy way of doing a elapsed = now - lastFrame.
    const elapsedTime = 1 / 60;
    degreesTimeout = window.setInterval(() => {
      degrees += degreesPerSecond * elapsedTime;
      if (degrees > 360) {
        degrees -= 360;
      }
    }, 1000 / 60);
  });

  onDestroy(() => {
    clearInterval(degreesTimeout);
  });

  function initColors(): void {
    const totalColors = 21;
    let result: string[] = [];

    const randomHSV = {
      hue: Math.round(Math.random() * 360),
        saturation: Math.random(),
      value: Math.random(),
    };
    const rgb = hsvToRGB(randomHSV.hue, randomHSV.saturation, randomHSV.value);
    const hex = rgbaToHex(rgb.red, rgb.green, rgb.blue, 1, true)
    result.push(hex);

    for (let i = 0; i < totalColors - 1; i++) {
      // Add a lot of white colours!
      result.push("#ffffff");
    }

    colors = result;
  }

  function setActive(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const index = parseInt(target.dataset['index'], 10);
    currentIndex = index;

    dispatchColorChanged();
  }

  function dispatchColorChanged(): void {
    const color = colors[currentIndex];
    dispatch('colorChanged', {
      color,
    });
  }

  function updateCurrentColor(): void {
    const currentColor = colors[currentIndex];
    // This can happen while components are initializing.
    if (!currentColor) {
      return;
    }

    colors[currentIndex] = pickedColor;
  }
</script>
<style lang="scss">

  .color-swatch {
    display: grid;
    grid-template-columns: repeat(7, 32px);
    grid-gap: 4px;
  }

  .color-swatch-item {
    display: inline-block;
    width: 32px;
    height: 32px;
    border-width: 2px;
    border-style: solid;
    border-image-slice: 1;
    // Super flashy rainbow border!
    //border-image-source: linear-gradient(var(--degrees), rgb(255, 0, 0) 0%, rgb(255, 0, 255) 16.67%, rgb(0, 0, 255) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 255, 0) 66.67%, rgb(255, 255, 0) 83.33%, rgb(255, 0, 0) 100%);
    border-image-source: linear-gradient(var(--degrees), #badbad, #6c18f4);
    cursor: pointer;

    &:not(.active):hover {
      border-image-source: linear-gradient(var(--degrees), #ed9fe1, #9ce8dc);
    }
  }

  .active {
    border-image-source: linear-gradient(var(--degrees), rgb(255, 0, 0) 0%, rgb(255, 0, 255) 16.67%, rgb(0, 0, 255) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 255, 0) 66.67%, rgb(255, 255, 0) 83.33%, rgb(255, 0, 0) 100%);
  }

</style>

<div class="color-swatch" style="--degrees: {degrees}deg;">
  {#each colors as color, i}
    <div
      class="color-swatch-item"
      class:active={i === currentIndex}
      style="background-color: {color};"
      data-index={i}
      on:click={setActive}
    ></div>
  {/each}
</div>
