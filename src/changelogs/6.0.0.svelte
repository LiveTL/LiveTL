<script>
  import { ExpansionPanel, ExpansionPanels, Icon } from "svelte-materialify";
  let value;
</script>

<ExpansionPanels bind:value>
  <ExpansionPanel>
    <span slot="header">New design elements!</span>
    This version integrates Material UI components. Enjoy a new, modern interface
    with buttery smooth animations!
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Embedded Mode</span>
    You can now load LiveTL right within the YouTube interface without using the
    popout mode.
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">New filter options</span>
    LiveTL now has advanced filtering options like username/message filters in both
    plaintext and regex! Check them out in the "Filters" tab in the settings menu.
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">Rewritten from the ground up</span>
    The entire extension has been rewritten from scratch. No longer do you have to
    deal with the janky mechanics and bugs of previous versions!
  </ExpansionPanel>
  <ExpansionPanel>
    <span slot="header">AI Translations are coming soon!</span>
    <p>
      For the past few months, our team has been hard at work on a project
      called Kanatran, or KT for short. We already have the system up and
      running at a small scale, and with financial support from users like you,
      we can apply KT to more Hololive/Vtuber streams! If you are interested in
      funding this project, please consider
      <a href="https://opencollective.com/livetl" target="_blank"
        >chipping in through Open Collective</a
      >.
    </p>
  </ExpansionPanel>
</ExpansionPanels>
