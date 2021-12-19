<script lang="ts">
  import { onMount } from 'svelte';
  import { get, writable } from 'svelte/store';
  import Button from 'smelte/src/components/Button';
  import Card from './common/Card.svelte';
  import Dialog from './common/Dialog.svelte';
  import { FeaturePrompt } from '../js/constants.js';
  import { enable as enableFeaturePrompt } from '../js/featureprompt.js';
  import { neverShowSpotlightPrompt, promptToShow, showHelpPrompt } from '../js/store.js';
  import { getWAR } from '../js/utils.js';
import Notification from './common/Notification.svelte';

  onMount(enableFeaturePrompt);

  let prompt = null;
  let active = true;

  // TODO change navigateToFeature to show an image of the feature
  // eslint-disable-next-line no-undef
  const prompts: Ltl.FeaturePromptContent[] = [{
    id: FeaturePrompt.SPOTLIGHT,
    prompt: 'Spotlight someone to only see their messages.',
    icon: 'record_voice_over',
    hasDismissed: writable(false),
    neverShow: neverShowSpotlightPrompt,
    demoLink: '/img/demos/spotlight.gif'
  }];

  const neverShowPrompt = (prompt: Ltl.FeaturePromptContent) => () => {
    prompt.neverShow.set(true);
    prompt = getLatestPrompt($promptToShow, $showHelpPrompt);
    active = Boolean(prompt);
  };

  const getLatestPrompt = (promptToShow, actuallyGetPrompt) => actuallyGetPrompt
    ? prompts
      .filter(p => promptToShow.includes(p.id))
      .find(p => !get(p.hasDismissed) && !get(p.neverShow))
    : null;

  // run when dialog closes
  $: if (!active && prompt) {
    prompt.hasDismissed.set(true);
    prompt = getLatestPrompt($promptToShow, $showHelpPrompt);
    active = Boolean(prompt);
  }

  $: prompt = getLatestPrompt($promptToShow, $showHelpPrompt);
  $: active = Boolean(prompt);
</script>

{#if prompt}
  <Notification bind:active>
    <div slot="title" class="text-center">Feature recommendation</div>
    <Card title={prompt.prompt} icon={prompt.icon} margin={false} addHeaderClasses="dark:bg-alert">
      <img alt={prompt.prompt} src={getWAR(prompt.demoLink)} />
    </Card>
    <div class="text-center">
      <Button color="error" on:click={neverShowPrompt(prompt)} small>
        Never show this prompt
      </Button>
    </div>
  </Notification>
{/if}
