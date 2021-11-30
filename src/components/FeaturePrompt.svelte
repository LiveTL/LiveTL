<script lang="ts">
  import { get, writable, Writable } from 'svelte/store';
  import Button from 'smelte/src/components/Button';
  import Card from './common/Card.svelte';
  import Dialog from './common/Dialog.svelte';
  import CheckBox from './common/CheckboxStore.svelte';
  import { showHelpPrompt } from '../js/store.js';
  import { getWAR } from '../js/utils.js';


  // TODO change navigateToFeature to show an image of the feature
  let prompts: FeaturePromptContent[] = [{
    prompt: 'Spotlight someone to only see their messages.',
    icon: 'record_voice_over',
    hasDismissed: writable(false),
    demoLink: '/img/demos/spotlight.gif'
  }];

  const dismissAllPrompts = () => {
    showHelpPrompt.set(false);
  };

  const getLatestPrompt = () => prompts.find(p => !get(p.hasDismissed));

  let prompt = getLatestPrompt();
  let active = Boolean(prompt);

  // run when dialog closes
  $: if (!active && prompt) {
    prompt.hasDismissed.set(true);
    prompt = getLatestPrompt();
  }
</script>

{#if prompt}
  <Dialog bind:active class="max-w-lg m-5 rounded-md" bgColor="bg-white dark:bg-dark-700">
    <div slot="title" class="text-center">Feature recommendation</div>
    <Card title={prompt.prompt} icon={prompt.icon}>
      <img src={getWAR(prompt.demoLink)} />
    </Card>
  </Dialog>
{/if}
