<script lang="ts">
	import ColorSelector from './color-selector/ColorSelector.svelte';
  import { isDragging } from './global-states.store';

  isDragging.subscribe((value) => {
    if (value) {
      document.body.classList.add('user-select-none');
    } else {
      document.body.classList.remove('user-select-none');
    }
  })
</script>
<style>

</style>

<main>
	<ColorSelector />
</main>


