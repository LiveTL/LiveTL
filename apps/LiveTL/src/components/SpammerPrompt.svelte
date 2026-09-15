<script>
  import {
    potentialSpammer,
    spamMsgAmount,
    spamMsgInterval,
    channelFilters,
    mchadUsers,
    spammersWhitelisted
  } from '../js/store.js';
  import { AuthorType } from '../js/constants.js';
  import { Queue } from '../js/queue.js';
  import Dialog from './common/Dialog.svelte';
  import Button from 'smelte/src/components/Button';

  const spammersProcessed = new Set();
  const spammerQueue = new Queue();
  let spammerInQuestion = $potentialSpammer;

  const refreshSpammerInQuestion = () => {
    if (!spammerQueue.empty()) {
      spammerInQuestion = spammerQueue.pop().data;
    } else {
      spammerInQuestion = null;
    }
  };

  const setBool = (bool, spammer) => {
    if (spammer.types & (AuthorType.mchad | AuthorType.tldex)) {
      mchadUsers.set(spammer.author, bool);
    } else {
      channelFilters.set(spammer.authorId, {
        name: spammer.author,
        blacklist: true,
        whitelist: false
      });
    }
  };

  const markAsSpammer = () => {
    setBool(true, spammerInQuestion);
    refreshSpammerInQuestion();
  };

  const markAsInnocent = () => {
    spammersWhitelisted.set(spammerInQuestion.authorId, {
      ...spammerInQuestion
    });
    refreshSpammerInQuestion();
  };

  $: if ($potentialSpammer !== null && !spammersProcessed.has($potentialSpammer.authorId)) {
    spammerQueue.push($potentialSpammer);
    spammersProcessed.add($potentialSpammer.authorId);
    potentialSpammer.set(null);
    if (spammerInQuestion === null) refreshSpammerInQuestion();
  }

  let dialogActive = false;
  const dismiss = () => {
    if (!dialogActive && spammerInQuestion !== null) {
      refreshSpammerInQuestion();
    }
  };
  $: dialogActive, dismiss();
  const refresh = () => (dialogActive = spammerInQuestion !== null);
  $: spammerInQuestion, refresh();
</script>

<Dialog
  title="Block Potential Spammer?"
  bind:active={dialogActive}
>
  <p>
    User
    <a
      class="text-primary-400 hover:underline"
      href="https://www.youtube.com/channel/{spammerInQuestion.authorId}"
      target="_blank"
    >
      {spammerInQuestion.author}
    </a>
    has sent at least {$spamMsgAmount} messages in the span
    of {$spamMsgInterval} seconds.
  </p>

  <p>You can adjust spam detection options in the settings panel.</p>

  <div slot="actions">
    <Button color="dark" on:click={() => (dialogActive = false)}>Do Nothing</Button>
    <Button color="success" on:click={markAsInnocent}>Whitelist</Button>
    <Button color="error" on:click={markAsSpammer}>Block</Button>
  </div>
</Dialog>
