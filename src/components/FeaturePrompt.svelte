<script lang="ts">
  import { get, writable, Writable } from 'svelte/store';
  import Button from 'smelte/src/components/Button';
  import Card from './common/Card.svelte';
  import CheckBox from './common/CheckboxStore.svelte';
  import { showHelpPrompt } from '../js/store.js';

  // TODO change navigateToFeature to show an image of the feature
  let prompts: FeaturePromptContent[] = [{
    prompt: 'Spotlight someone to only see their messages.',
    icon: 'record_voice_over',
    hasDismissed: writable(false),
    navigateToFeature: () => { }
  }];

  const dismissPrompt = (store: Writable<boolean>) => () => {
    store.set(true);
    prompts = [...prompts];
  };

  const dismissAllPrompts = () => {
    showHelpPrompt.set(false);
  };

  const navigateToFeature = (prompt: FeaturePromptContent) => () => {
    dismissPrompt(prompt.hasDismissed)();
    prompt.navigateToFeature();
  };
</script>

{#each prompts as prompt}
  {#if !get(prompt.hasDismissed)}
    <Card title={prompt.prompt} icon={prompt.icon} headerEndIcon="close" headerEndIconOnClick={dismissPrompt(prompt.hasDismissed)} noGap>
      <Button small on:click={navigateToFeature(prompt)}>
        Show me how!
      </Button>
    </Card>
  {/if}
{/each}
