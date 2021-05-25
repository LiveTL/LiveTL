<script>
  import { onMount } from 'svelte';
  import { ExpansionPanel, ExpansionPanels, Row } from 'svelte-materialify/src';

  export let isStandalone = false;

  const opencollectiveAPI = 'https://opencollective.com/livetl/members/all.json';
  const ghAPI = 'https://api.github.com/repos/LiveTL/LiveTL/contributors';
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

  let opencollective = [];
  let gh = [];
  onMount(async () => {
    [opencollective, gh] = await Promise.all([
      fetch(opencollectiveAPI).then(toJson),
      fetch(ghAPI).then(toJson)
    ]);
  });

  $: donators = uniqueUsers(opencollective)
    .filter(user => user.role === 'BACKER')
    .sort(compareDono);

  $: developers = gh
    .filter(dev => dev.type !== 'Bot');
</script>


<ExpansionPanels multiple>
  <ExpansionPanel>
    <span slot="header">Developers</span>
    <ol>
      {#each developers as { login: name }}
        <li>{name}</li>
      {/each}
    </ol>
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Donators</span>
    <ol>
      {#each donators as { name, totalAmountDonated }}
        <li>{name}: <span class="float-right">${totalAmountDonated}</span></li>
      {/each}
    </ol>
  </ExpansionPanel>
</ExpansionPanels>
