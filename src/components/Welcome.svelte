<script>
  import dark from 'smelte/src/dark';
  dark().set(true);

  const links = [{
    text: 'LiveTL Website',
    href: 'https://livetl.app'
  }, {
    text: 'Discord Server',
    href: 'https://discord.gg/uJrV3tmthg'
  }, {
    text: 'GitHub Repository',
    href: 'https://github.com/LiveTL/LiveTL'
  }, {
    text: 'Open Collective Donations',
    href: 'https://opencollective.com/livetl'
  }];
  document.title = 'Welcome to LiveTL!';

  const questions = [{
    prompt: 'How does LiveTL work?',
    response: `LiveTL is, at its core, 
               a chat filter for YouTube streams.
               It helps foreign viewers better catch
               translations that other viewers are 
               providing in the live chat. LiveTL 
               does not automatically translate streams 
               – instead, it picks up translations 
               found in the chat.`
  }, {
    prompt: 'Can I trust LiveTL translations?',
    response: `LiveTL's translations are entirely crowdsourced,
               so there is no guarantee that they are accurate.
               ALWAYS take caution when sharing translations 
               found in LiveTL.`
  }, {
    prompt: 'I installed LiveTL but I don’t see any buttons.',
    response: `Once you install the extension, you must reload
              the YouTube stream for LiveTL to take effect.`
  }, {
    prompt: 'I don’t see any translations in the translations panel.',
    response: `If there are no translators in chat, LiveTL is unable 
               to provide translations. Any messages properly tagged 
               with a language (ex. [en], ESP:, etc.) will appear when 
               they are available.`
  }, {
    prompt: 'A translator is using their own style of language tags.',
    response: 'You can manually select additional users to filter in the settings.'
  }];
</script>

<svelte:head>
  <link rel="shortcut icon" href="48x48.png" type="image/png" />
</svelte:head>

<div class="text-lg p-5 bg-dark-700">
  <h3>Thank you for installing LiveTL!</h3>
  <p>
    To get started, visit any YouTube stream or archive and open the chat. There
    will be new buttons to activate LiveTL at the bottom of the chat box.
  </p>

  <img
    src="https://raw.githubusercontent.com/LiveTL/LiveTL/develop/img/buttons.png"
    alt="img"
    class="w-full md:w-3/4 lg:w-3/5 my-2"
  />

  <h4>Frequently Asked Questions</h4>
  <ul class="list-disc list-inside divide-y divide-gray-700">
    {#each questions as q}
      <li class="py-1">
        <strong>{q.prompt}</strong>
        <br />
        {q.response}
      </li>
    {/each}
  </ul>

  <h4>Links</h4>
  <ul class="list-disc list-inside">
    {#each links as link}
      <li>
        <a href={link.href} target="_blank" class="text-blue-400 underline"
          >{link.text}</a
        >
      </li>
    {/each}
  </ul>
</div>
