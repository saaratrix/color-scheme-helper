<script lang="ts">
  import ColorCircleGroup from "./ColorCircleGroup.svelte";
  import { rgbToHSV } from '../color-selector/helpers/color-space-helpers';

  export let width: string = '';
  export let height: string = '';

  let groups = []
  for (let i = 0; i < 12; i++) {
    groups.push(createGroup(i));
  }

  function createGroup(index: number) {
    const degrees = index * 30;

    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);

    const hsv = rgbToHSV(r, g, b);

    return {
      degrees,
      hsv,
    };
  }
</script>
<style lang="scss">
  .circle-container {
    position: relative;
  }

  .outline-circle {
    position: absolute;
    width: 100%;
    height: 100%;

    //background-color: pink;
    clip-path: circle(50% at 50% 50%);
    pointer-events: none;
  }

  .outline-circle-angle-lines {
    position: absolute;
    width: 100%;
    height: 100%;

    --border-color: white;
    --lg: transparent calc(50% - 1px), var(--border-color) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px);

    // Offsetted by 15 degrees since the sector at for example 0 degrees arcs 15 degrees up and 15 degrees down.
    background: linear-gradient(165deg, var(--lg)),
                linear-gradient(135deg, var(--lg)),
                linear-gradient(105deg, var(--lg)),
                linear-gradient(75deg, var(--lg)),
                linear-gradient(45deg, var(--lg)),
                linear-gradient(15deg, var(--lg));
  }

  .main-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;

    clip-path: circle(8% at 50% 50%);
  }

</style>

<div class="circle-container" style="background-color: black; width: {width}; height: {height};">
  {#each groups as group}
    <ColorCircleGroup rotation="{group.degrees}" hsv="{group.hsv}"></ColorCircleGroup>
  {/each}


  <div class="outline-circle">
    <div class="outline-circle-angle-lines"></div>
    <div class="outline-circle-round-lines"></div>
  </div>
  <div class="main-circle"></div>
</div>
