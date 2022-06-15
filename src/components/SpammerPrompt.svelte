<script>
  import { potentialSpammer, spammersDetected } from '../js/store.js';
  import { Queue } from '../js/queue.js';

  const spammersProcessed = new Set();
  const spammerQueue = new Queue();
  let spammerInQuestion = $potentialSpammer;

  const refreshSpammerInQuestion = () => {
    if (!spammerQueue.empty()) {
      spammerInQuestion = spammerQueue.pop().data;
    }
  };

  const markAsSpammer = () => {
    spammersDetected.set(spammerInQuestion.authorId, {
      ...spammerInQuestion, spam: true
    });
    refreshSpammerInQuestion();
  };

  const markAsInnocent = () => {
    spammersDetected.set(spammerInQuestion.authorId, {
      ...spammerInQuestion, spam: false
    });
    refreshSpammerInQuestion();
  };

  $: if ($potentialSpammer !== null && !spammersProcessed.has($potentialSpammer.authorId)) {
    spammerQueue.push($potentialSpammer);
    spammersProcessed.add($potentialSpammer.authorId);
    potentialSpammer.set(null);
    if (spammerInQuestion === null) refreshSpammerInQuestion();
  }

  $: window.markAsSpammer = markAsSpammer;
  $: window.markAsInnocent = markAsInnocent;
</script>
