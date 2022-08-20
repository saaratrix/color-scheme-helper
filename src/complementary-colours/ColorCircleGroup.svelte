<script lang="ts">
  import type { ColorHSV } from '../color-selector/models/colors/color-hsv';
  import { hsvToCSS } from '../color-selector/helpers/color-space-helpers';

  export let rotation: number = 0;
  export let hsv: ColorHSV = { value: 0.5, hue: 0, saturation: 0 };

  let circle1: string = '';
  let circle2: string = '';
  let circle3: string = '';
  let circle4: string = '';

  $: hsv, onColorChanged();

  function onColorChanged() {
    circle1 = hsvToCSS(hsv.hue, hsv.saturation, hsv.value);
    circle2 = hsvToCSS(hsv.hue, hsv.saturation, hsv.value - 0.1);
    circle3 = hsvToCSS(hsv.hue, hsv.saturation, hsv.value - 0.2);
    circle4 = hsvToCSS(hsv.hue, hsv.saturation, hsv.value - 0.3);
  }

</script>
<style lang="scss">
  .circle-group {
    position: absolute;
    width: 100%;
    height: 100%;

    clip-path: polygon(50% 50%, 100% 63.5%, 100% 36.5%, 50% 50%);
  }

  .circle {
    position: absolute;
    width: 100%;
    height: 100%;

    &:hover {
      background-color: grey !important;
    }
  }

  .circle-1 {
    position: absolute;
    clip-path: circle(50% at 50% 50%);
  }

  .circle-2 {
    position: absolute;
    clip-path: circle(40% at 50% 50%);
  }

  .circle-3 {
    position: absolute;
    clip-path: circle(30% at 50% 50%);
  }

  .circle-4 {
    position: absolute;
    clip-path: circle(20% at 50% 50%);
  }
</style>
<!-- translateZ() because of firefox, 180deg doesn't render otherwise. -->
<div class="circle-group" style="transform: rotate({ rotation }deg) translateZ(0.0001px);">
  <div class="circle circle-1" style="background-color: {circle1}"></div>
  <div class="circle circle-2" style="background-color: {circle2}"></div>
  <div class="circle circle-3" style="background-color: {circle3}"></div>
  <div class="circle circle-4" style="background-color: {circle4}"></div>
</div>
