<script lang="ts">
  import { tick } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  /** Vertical offset in px. Default: 5 */
  export let offsetY = 5;
  /** Small variant. */
  export let small = false;

  let show = false;
  let activator: HTMLElement | undefined;
  let tooltipDiv: HTMLElement | undefined;
  let windowInnerHeight = 0;
  let windowInnerWidth = 0;
  let offsetX = '';
  let offsetYStyle = '';

  const onShowChange = async (show: boolean) => {
    if (!show) return;
    await tick();
    if (!activator || !tooltipDiv) {
      console.error('Tooltip activator or tooltipDiv undefined');
      return;
    }

    const activatorRect = activator.getBoundingClientRect();
    const halfTooltipWidth = tooltipDiv.clientWidth / 2;

    if (activatorRect.left - halfTooltipWidth < 0) {
      offsetX = 'left-0';
    } else if (activatorRect.right + halfTooltipWidth > windowInnerWidth) {
      offsetX = 'right-0';
    } else {
      offsetX = 'left-1/2 transform -translate-x-1/2';
    }

    const tooltipHeightOffset = tooltipDiv.clientHeight + offsetY;
    if (activatorRect.bottom + tooltipHeightOffset > windowInnerHeight) {
      offsetYStyle = `top: -${tooltipHeightOffset}px`;
    } else {
      offsetYStyle = `bottom: -${tooltipHeightOffset}px`;
    }
  };

  $: onShowChange(show);
  $: classes = 'whitespace-nowrap absolute bg-gray-800 text-gray-50 z-30 ' +
    `rounded shadow-lg ${offsetX} ${$$props.class ?? ''} ` +
    (small ? 'text-xs py-1 px-2' : 'text-sm py-2 px-3');
</script>

<svelte:window
  bind:innerHeight={windowInnerHeight}
  bind:innerWidth={windowInnerWidth}
/>

<div class="relative inline-block">
  <div
    on:mouseenter={() => (show = true)}
    on:mouseleave={() => (show = false)}
    bind:this={activator}
  >
    <slot name="activator" />
  </div>

  {#if show}
    <div
      in:scale|local={{ duration: 200 }}
      out:fade|local={{ duration: 200, delay: 100 }}
      class={classes}
      style={offsetYStyle}
      bind:this={tooltipDiv}
    >
      <slot />
    </div>
  {/if}
</div>
