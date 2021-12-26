<script lang="ts">
  import { TextDirection } from '../../js/constants';

  import { textDirection } from '../../js/store';

  import IconButton from './IconButton.svelte';

  export let active = false;

  let mouseOver = false;
  let closingAnimation = false;

  const mouseLeft = () => close(true);

  export let close = (omitActiveToggle = false) => {
    return new Promise<void>(resolve => {
      closingAnimation = true;
      setTimeout(() => {
        closingAnimation = false;
        active = omitActiveToggle;
        mouseOver = false;
        resolve();
      }, 250);
    });
  };
</script>

{#if active}
  <div
    class="notification"
    on:mouseenter={() => {
      if (!closingAnimation) mouseOver = true;
    }}
    on:mouseleave={mouseLeft}
  >
    <div class:animated={mouseOver}>
      <div
        class="slot bg-dark-600 {closingAnimation ? 'closing' : ''}"
        style="{$textDirection === TextDirection.BOTTOM
          ? 'top'
          : 'bottom'}: 0px;"
      >
        <slot />
      </div>
    </div>
    <div>
      <IconButton
        slot="activator"
        icon="info"
        color="alert"
        class="ml-auto"
        noPadding
      />
    </div>
  </div>
{/if}

<style>
  .notification {
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 100;
  }
  .notification:hover .slot:not(.closing) {
    transform: translateX(0px);
    opacity: 1;
  }
  .slot {
    transform-origin: bottom right;
    transition: 0.25s;
    overflow: hidden;
    transform: translateX(100%);
    opacity: 0;
    border-radius: 0.5rem;
    position: absolute;
    right: 0px;
    z-index: 1000;
    width: 300px;
    border: 0px;
    padding-bottom: 0.5rem;
  }
  .animated {
    animation: fade-in 0.25s;
    transition-property: opacity, transform;
  }
  :not(.animated)>.slot {
    height: 0px !important;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0px);
    }
  }
</style>
