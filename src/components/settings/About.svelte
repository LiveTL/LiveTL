<script>
  import opencollective from '../../plugins/opencollective.json';
  import gh from '../../plugins/gh.json';
  import ExpandingCard from '../common/ExpandingCard.svelte';

  const compareAttr = attr => (a, b) => a[attr] - b[attr];
  const reverseCompare = cmp => (a, b) => -cmp(a, b);
  const compareDono = reverseCompare(compareAttr('totalAmountDonated'));
  const uniqueBy = attr => arr => {
    const vals = new Set();
    return arr.filter(v => {
      if (vals.has(v[attr])) return false;
      vals.add(v[attr]);
      return true;
    });
  };
  const uniqueUsers = uniqueBy('profile');

  $: donators = uniqueUsers(opencollective)
    .filter(user => user.role === 'BACKER')
    .sort(compareDono);

  $: developers = gh
    .filter(dev => dev.type !== 'Bot');
</script>

<ExpandingCard title="Developers and Contributors" icon="group">
  <ul class="list-disc underline text-base p-2 list-inside">
    {#each developers as { login: name }}
      <li>
        <a
          href="https://github.com/{name}"
          target="_blank"
          class="text-blue-400"
        >
          {name}
        </a>
      </li>
    {/each}
  </ul>
</ExpandingCard>
<ExpandingCard title="Donators and Supporters" icon="attach_money">
  <div class="text-base p-2">
    <a
      href="https://opencollective.com/livetl"
      target="_blank"
      class="text-blue-400 underline"
    >
      Please consider donating through Open Collective!
    </a>
    <ol class="list-decimal p-2 list-inside">
      {#each donators as { name, totalAmountDonated, profile }}
        <li>
          <a
            href={profile}
            target="_blank"
            class="text-blue-400 underline"
          >
            {name}
          </a>
          <span class="float-right">${totalAmountDonated}</span>
        </li>
      {/each}
    </ol>
  </div>
</ExpandingCard>
<ExpandingCard
  title="Contact the Devs"
  icon="contact_support"
>
  <div class="p-2 text-base">
    <span>The quickest way to contact the developers is through the </span>
    <a
      href="https://discord.gg/uJrV3tmthg"
      target="_blank"
      class="text-blue-400 underline"
    >
      LiveTL Discord server
    </a>
    <span>.</span>
    <br />
    <br />
    <span>Here are some other links:</span>
    <ul class="list-disc p-2 list-inside">
      <li>
        <a
          href="https://livetl.app/"
          target="_blank"
          class="text-blue-400 underline"
        >
          Website
        </a>
      </li>
      <li>
        <a
          href="https://github.com/LiveTL/LiveTL"
          target="_blank"
          class="text-blue-400 underline"
        >
          GitHub repository
        </a>
      </li>
    </ul>
  </div>
</ExpandingCard>
