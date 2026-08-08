<script lang="ts">
  import { refreshScroll, translatorClient, translateTargetLanguage } from '../ts/storage';
  import Icon from './common/Icon.svelte';
  import { Theme } from '../ts/chat-constants';

  export let forceTLColor: Theme = Theme.YOUTUBE;

  export let text: string;
  let translatedMessage = '';
  let translatedLanguage = '';
  let showOriginal = false;

  $: if ($translateTargetLanguage && $translatorClient) {
    $translatorClient.translate(text, $translateTargetLanguage).then(result => {
      if (result !== text) {
        translatedLanguage = $translateTargetLanguage;
        translatedMessage = result;
        $refreshScroll = true;
      }
    });
  }

  $: hasTranslation = Boolean(translatedMessage && translatedMessage.trim() !== text.trim());
  $: showTL = hasTranslation && !showOriginal;

  $: if ($translateTargetLanguage !== translatedLanguage) {
    translatedMessage = '';
    translatedLanguage = '';
  }

  $: translatedColor = forceTLColor === Theme.DARK
    ? 'text-translated-dark'
    : `text-translated-light ${forceTLColor === Theme.YOUTUBE ? 'dark:text-translated-dark' : ''}`;

</script>

<!-- Comments absorb indentation whitespace that would leak between adjacent text runs.
     The translate icon's visual gap is provided by margin on .material-icons in the style block. -->
<span
  class={showTL ? translatedColor : ''}
  class:cursor-pointer={hasTranslation}
  class:entrance-animation={hasTranslation}
  on:click={() => {
    if (hasTranslation) {
      showOriginal = !showOriginal;
      $refreshScroll = true;
    }
  }}
><!--
-->{showTL ? translatedMessage : text}<!--
-->{#if hasTranslation}<!--
  --><span class="shifted-icon"><Icon xs={true} block={false}>translate</Icon></span><!--
-->{/if}<!--
--></span>

<style>
  .shifted-icon  :global(.material-icons) {
    transform: translateY(1px);
    margin: 0 0.25em;
  }
</style>
