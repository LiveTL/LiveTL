<script lang="ts">
  import { onMount } from 'svelte';
  import { get, writable } from 'svelte/store';
  import Button from 'smelte/src/components/Button';
  import Card from './common/Card.svelte';
  import { FeaturePrompt } from '../js/constants.js';
  import { enable as enableFeaturePrompt } from '../js/featureprompt.js';
  import {
    neverShowSpotlightPrompt,
    promptToShow,
    showHelpPrompt
  } from '../js/store.js';
  import { getWAR } from '../js/utils.js';
  import Notification from './common/Notification.svelte';

  onMount(enableFeaturePrompt);

  let prompt = null;
  let active = true;
  let close: (omitActiveToggle: boolean) => Promise<void>;

  // TODO change navigateToFeature to show an image of the feature
  // eslint-disable-next-line no-undef
  const prompts: Ltl.FeaturePromptContent[] = [
    {
      id: FeaturePrompt.SPOTLIGHT,
      prompt: 'Spotlight someone to only see their messages.',
      icon: 'record_voice_over',
      hasDismissed: writable(false),
      neverShow: neverShowSpotlightPrompt,
      demoLink: '/img/demos/spotlight.mp4'
    }
  ];

  const neverShowPrompt = (prompt: Ltl.FeaturePromptContent) => async () => {
    await close(false);
    prompt.neverShow.set(true);
    prompt = getLatestPrompt($promptToShow, $showHelpPrompt);
    active = Boolean(prompt);
  };

  const getLatestPrompt = (promptToShow, actuallyGetPrompt) =>
    actuallyGetPrompt
      ? prompts
        .filter((p) => promptToShow.includes(p.id))
        .find((p) => !get(p.hasDismissed) && !get(p.neverShow))
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
  <Notification bind:active bind:close>
    <div slot="title" class="text-center">Feature recommendation</div>
    <Card
      title={prompt.prompt}
      icon={prompt.icon}
      margin={false}
      bgColor="dark:bg-alert-400"
      addHeaderClasses="text-black"
    >
      <video
        class="w-full h-full"
        on:contextmenu={(e) => e.preventDefault()}
        autoplay
        muted
        loop
      >
        <source src={getWAR(prompt.demoLink)} type="video/mp4" />
        <track kind="captions" />
      </video>
    </Card>
    <div class="flex justify-between pl-3 pr-3">
      <Button
        text
        color="error"
        on:click={neverShowPrompt(prompt)}
        small
      >
        Never show again
      </Button>
      <Button color="primary" on:click={() => close(false)} small>Dismiss</Button>
    </div>
  </Notification>
{/if}
