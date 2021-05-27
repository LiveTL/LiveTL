<script>
  import { onMount } from 'svelte';
  import { ExpansionPanel, ExpansionPanels, Row } from 'svelte-materialify/src';
  import opencollective from '../plugins/opencollective.json';
  import gh from '../plugins/gh.json';

  export let isStandalone = false;

  const compareAttr = attr => (a, b) => a[attr] - b[attr];
  const reverseCompare = cmp => (a, b) => -cmp(a, b);
  const compareDono = reverseCompare(compareAttr('totalAmountDonated'));
  const toJson = r => r.json();
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

<ExpansionPanels multiple>
  <ExpansionPanel>
    <span slot="header">Developers and Contributors</span>
    <ul>
      {#each developers as { login: name }}
        <li><a href="https://github.com/{name}" target="_blank">{name}</a></li>
      {/each}
    </ul>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Donators and Supporters</span>
    <p>
      <a href="https://opencollective.com/livetl" target="_blank">
        Please consider donating through Open Collective!
      </a>
    </p>
    <ol>
      {#each donators as { name, totalAmountDonated, profile }}
        <li>
          <a href={profile} target="_blank">{name}</a>
          <span class="float-right">${totalAmountDonated}</span>
        </li>
      {/each}
    </ol>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Contact the Devs</span>
    <ol>
      The quickest way to contact the developers is through the <a
        href="https://discord.gg/uJrV3tmthg"
        target="_blank">LiveTL Discord server</a
      >.
      <br />
      <br />
      Here are some other links:
      <ul>
        <li>
          <a href="https://livetl.app/" target="_blank">Website</a>
        </li>
        <li>
          <a href="https://github.com/LiveTL/LiveTL" target="_blank"
            >GitHub repository</a
          >
        </li>
      </ul>
    </ol>
  </ExpansionPanel>
</ExpansionPanels>

<style>
  ul,
  ol {
    padding-left: 24px;
    width: calc(100% - 24px);
  }

  :global(.s-expansion-panel__content) {
    flex-direction: column !important;
  }

</style>
