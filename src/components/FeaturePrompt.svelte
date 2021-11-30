<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Card from './common/Card.svelte';
  import Dialog from './common/Dialog.svelte';
  import { FeaturePrompt } from '../js/constants.js';
  import { enable as enableFeaturePrompt } from '../js/featureprompt.js';
  import { hasShownSpotlightPrompt, promptToShow, showHelpPrompt } from '../js/store.js';
  import { getWAR } from '../js/utils.js';

  onMount(enableFeaturePrompt);

  // TODO change navigateToFeature to show an image of the feature
  // eslint-disable-next-line no-undef
  const prompts: FeaturePromptContent[] = [{
    id: FeaturePrompt.SPOTLIGHT,
    prompt: 'Spotlight someone to only see their messages.',
    icon: 'record_voice_over',
    hasDismissed: hasShownSpotlightPrompt,
    demoLink: '/img/demos/spotlight.gif'
  }];

  const getLatestPrompt = (promptToShow, actuallyGetPrompt) => actuallyGetPrompt
    ? prompts
      .filter(p => promptToShow.includes(p.id))
      .find(p => !get(p.hasDismissed))
    : null;

  $: prompt = getLatestPrompt($promptToShow, $showHelpPrompt);
  let active = Boolean(prompt);

  // run when dialog closes
  $: if (!active && prompt) {
    prompt.hasDismissed.set(true);
    prompt = getLatestPrompt($promptToShow, $showHelpPrompt);
    active = true;
  }
</script>

{#if prompt}
  <Dialog bind:active class="max-w-lg m-5 rounded-md" bgColor="bg-white dark:bg-dark-700">
    <div slot="title" class="text-center">Feature recommendation</div>
    <Card title={prompt.prompt} icon={prompt.icon}>
      <img alt={prompt.prompt} src={getWAR(prompt.demoLink)} />
    </Card>
  </Dialog>
{/if}
