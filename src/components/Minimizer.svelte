<script>
  import {
    welcomeDismissed,
    textDirection
  } from '../js/store.js';
  import Button from 'svelte-materialify/src/components/Button.svelte';
  import Icon from 'svelte-materialify/src/components/Icon.svelte';
  import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
  import {
    TextDirection
  } from '../js/constants.js';
</script>

<div
  class="minimizeContainer"
  style="transform: translateX(calc(0px - var(--margin))) {$textDirection ==
  TextDirection.BOTTOM
    ? 'translateY(-5px)'
    : ''} !important;"
>
  <Button
    fab
    class="minimizeBar"
    on:click={() => ($welcomeDismissed = !$welcomeDismissed)}
  >
    <Icon
      path={[mdiChevronDown, mdiChevronUp][
        $welcomeDismissed
          ? $textDirection == TextDirection.BOTTOM
            ? 1
            : 0
          : $textDirection == TextDirection.TOP
          ? 1
          : 0
      ]}
    />
  </Button>
</div>

<style>
  :global(.minimizeBar) {
    margin-left: 0px !important;
    height: 10px !important;
    width: 100% !important;
    display: flex;
    justify-content: center;
    overflow: hidden !important;
    background-color: transparent !important;
    border-radius: 10px !important;
    box-shadow: none !important;
  }

  .minimizeContainer {
    height: 5px !important;
    display: flex !important;
    flex-direction: column !important;
    width: calc(100% + 2 * var(--margin)) !important;
    align-items: center !important;
  }

  .minimizeContainer :global(.s-btn__content) {
    /* background-color: rgba(255, 255, 255, 0.1) !important; */
    box-shadow: none !important;
  }
</style>
