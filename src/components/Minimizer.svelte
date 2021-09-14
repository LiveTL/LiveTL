<script lang="ts">
  import { welcomeDismissed, textDirection } from '../js/store.js';
  import { TextDirection } from '../js/constants.js';
  import Button from './common/IconButton.svelte';

  const getIcon = (dismissed: boolean, direction: TextDirection) => {
    return ['expand_more', 'expand_less'][
      dismissed
        ? direction === TextDirection.BOTTOM
          ? 1
          : 0
        : direction === TextDirection.TOP
        ? 1
        : 0
    ];
  };
  $: icon = getIcon($welcomeDismissed, $textDirection);
</script>

<div id="wrapper">
  <Button
    {icon}
    noRound
    noPadding
    on:click={() => ($welcomeDismissed = !$welcomeDismissed)}
    class="w-full"
    color="gray"
    iconClass="mx-auto text-lg"
  />
</div>

<style>
  #wrapper :global(i) {
    line-height: 0.5em;
  }
</style>
