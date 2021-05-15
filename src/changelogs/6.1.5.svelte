<script>
    import { ExpansionPanel, ExpansionPanels } from 'svelte-materialify';
    import V6 from './common/6.1.svelte';
    let value = [1];
</script>

<ExpansionPanels bind:value>
  <V6 />

  <ExpansionPanel>
    <span slot="header">Donations are open again!</span>
    <div>
      Donations were temporarily shut down on May 10th as a result of the
      indefinite postponement of Kanatran. It's back online now, though! If you
      would like to support the LiveTL developer team, please consider
      <a href="https://opencollective.com/livetl" target="_blank"
        >chipping in through Open Collective</a
      >. We have many new features in the works (like our own community captions
      system).
    </div>
  </ExpansionPanel>

  <ExpansionPanel>
    <span slot="header">Known issues</span>
    <div>
      <ul>
        <li>Vertical mode has not yet been implemented.</li>
        <li>Changelogs do not appear in popout mode.</li>
      </ul>
    </div>
  </ExpansionPanel>
</ExpansionPanels>
