<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { NuuColorPickerConfirmEvents } from './models/events/nuu-color-picker-confirm-events';
  const dispatch = createEventDispatcher<NuuColorPickerConfirmEvents>();

  function onCancelClicked(): void {
    dispatch('cancel');
  }

  function onConfirmClicked(): void {
    dispatch('ok');
  }
</script>
<style lang="scss">
  .nuu-color-confirm {
    display: flex;
    align-items: flex-end;
  }

  .color-cancel-button {
    display: inline-block;
    padding: 0 4px;
    font-weight: bold;
    font-size: 16pt;
    color: red;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: darkred;
    }

    &:active {
      color: #ac73bc;
    }

  }

  .color-confirm-button {
    display: inline-block;
    padding: 0 4px;
    font-weight: bold;
    font-size: 16pt;
    color: green;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: lime;
    }

    &:active {
      color: #ac73bc;
    }
  }
</style>

<div class="nuu-color-confirm">
  <div class="color-cancel" on:click={onCancelClicked}><span class="color-cancel-button" title="NO!">✖</span></div>
  <div class="color-ok" on:click={onConfirmClicked}><span class="color-confirm-button" title="OK!">✓</span></div>
</div>

