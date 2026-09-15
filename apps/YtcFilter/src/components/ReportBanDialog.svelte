<script lang="ts">
  import type { ChatReportUserOptions } from '../ts/chat-constants';
  import { chatReportUserOptions } from '../ts/chat-constants';
  import {
    reportDialog,
    chatActionOptionDialog,
    alertDialog
  } from '../ts/storage';
  import Dialog from './common/Dialog.svelte';
  import type { Writable } from 'svelte/store';
  import RadioGroupStore from './common/RadioGroupStore.svelte';
  import Button from 'smelte/src/components/Button';
  $: optionStore = $reportDialog?.optionStore as Writable<ChatReportUserOptions>;
  $: actionOptionStore = $chatActionOptionDialog?.optionStore as Writable<string>;
</script>

<Dialog active={Boolean($reportDialog)} class="max-w-full max-h-full" style="height: 500px; width: 500px;">
  <svelte:fragment slot="title">Report User</svelte:fragment>

  <div>
    <RadioGroupStore
      store={optionStore}
      items={chatReportUserOptions}
      vertical
    />
  </div>

  <div slot="actions">
    <Button on:click={() => {
      $reportDialog?.callback($optionStore);
      $reportDialog = null;
    }} color="error" disabled={!$optionStore}>Report</Button>
  </div>
</Dialog>

<Dialog active={Boolean($chatActionOptionDialog)} class="max-w-full max-h-full" style="height: 360px; width: 420px;">
  <svelte:fragment slot="title">{$chatActionOptionDialog?.title}</svelte:fragment>
  <div>
    <RadioGroupStore
      store={actionOptionStore}
      items={$chatActionOptionDialog?.items ?? []}
      vertical
    />
  </div>
  <div slot="actions">
    <Button on:click={() => {
      $chatActionOptionDialog?.callback($actionOptionStore);
      $chatActionOptionDialog = null;
    }} color="error" disabled={!$actionOptionStore}>{$chatActionOptionDialog?.confirmText}</Button>
  </div>
</Dialog>

<Dialog active={Boolean($alertDialog)} noCloseButton>
  <svelte:fragment slot="title">{$alertDialog?.title}</svelte:fragment>

  <div>
    {$alertDialog?.message}
  </div>

  <div slot="actions">
    <Button on:click={() => {
      $alertDialog = null;
    }} color="primary">OK</Button>
  </div>
</Dialog>
