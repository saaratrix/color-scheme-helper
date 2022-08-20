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

    const degreesPerSecond = 360 / 60;
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
      result.push("");
    }

    colors = result;
  }

  function setActive(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const index = parseInt(target.dataset['index'], 10);
    currentIndex = index;

    // Only dispatch the event if we have an actual color.
    // This is to that the colors can be empty slots and you can change to them without affecting the "current color" in the picker.
    if (colors[currentIndex]) {
      dispatchColorChanged();
    }
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
    if (typeof currentColor === 'undefined') {
      return;
    }

    colors[currentIndex] = pickedColor;
    // Reset the picked color, so it can be set the same value since Svelte doesn't like to emit same event.
    pickedColor = "";
  }
</script>
<style lang="scss">
  $hover-rgb-strength: 192;
  $active-rgb-strength: 255;

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

    border-image-source: linear-gradient(var(--degrees), #badbad, #88308e);
    cursor: pointer;

    &:not(.active):hover {
      border-image-source: linear-gradient(var(--degrees), rgb($hover-rgb-strength, 0, 0) 0%, rgb($hover-rgb-strength, 0, $hover-rgb-strength) 16.67%, rgb(0, 0, $hover-rgb-strength) 33.33%, rgb(0, $hover-rgb-strength, $hover-rgb-strength) 50%, rgb(0, $hover-rgb-strength, 0) 66.67%, rgb($hover-rgb-strength, $hover-rgb-strength, 0) 83.33%, rgb($hover-rgb-strength, 0, 0) 100%);
    }

    &:not(.active):active {
      border-image-source: linear-gradient(var(--degrees), rgb($active-rgb-strength, 0, 0) 0%, rgb($active-rgb-strength, 0, $active-rgb-strength) 16.67%, rgb(0, 0, $active-rgb-strength) 33.33%, rgb(0, $active-rgb-strength, $active-rgb-strength) 50%, rgb(0, $active-rgb-strength, 0) 66.67%, rgb($active-rgb-strength, $active-rgb-strength, 0) 83.33%, rgb($active-rgb-strength, 0, 0) 100%);
    }
  }

  .active {
    // Super flashy rainbow border!
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
