<script lang="ts">
  import {
    translateTargetLanguage
  } from '../../ts/storage';
  import DropdownStore from '../common/DropdownStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import { AvailableLanguages } from 'iframe-translator';
  import type { AvailableLanguageCodes } from 'iframe-translator';
  import { writable } from 'svelte/store';
  import { onMount, tick } from 'svelte';
  const enabled = writable(true);
  $: if (!$enabled) {
    $translateTargetLanguage = '';
  }
  onMount(() => {
    const unsub = translateTargetLanguage.subscribe(value => {
      $enabled = Boolean(value);
      setTimeout(() => { unsub(); }, 0);
    });
  });
  const priority: AvailableLanguageCodes[] = [
    'en',
    'ja',
    'id',
    'ko',
    'es',
    'ru',
    'fr',
    'zh-CN',
    'zh-TW'
  ];

  async function scrollToBottom() {
    await tick();
    window.scrollTo(0, document.body.scrollHeight);
  }

  const items = [
    ...priority.map(lang => ({
      text: AvailableLanguages[lang],
      value: lang
    })),
    ...(Object.keys(AvailableLanguages) as AvailableLanguageCodes[])
      .filter(e => !priority.includes(e)).map(lang => ({
        text: AvailableLanguages[lang],
        value: lang
      }))
  ];
</script>

<span on:click={scrollToBottom}>
  <Checkbox name="Translate chat messages with Google Translate (experimental)" store={enabled} />
  {#if $enabled}
    <DropdownStore
      name="Target language"
      store={translateTargetLanguage}
      {items}
    />
  {/if}
</span>
