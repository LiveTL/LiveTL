# Getting Started with LiveTL

<span id="actionMessage">
You must have the <a href="https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg">LiveTL extension</a> installed to use LiveTL features.
</span>

## Launching LiveTL

To get started, visit your favorite streamer on YouTube. The chat should have some new buttons for launching LiveTL!

![](../img/openlivetl.png)

Alternatively, you can open LiveTL from within HoloTools!

![](../img/holotoolslauncher.png)

## Frequently Asked Questions

### How does LiveTL work?
LiveTL is, at its core, a chat filter for YouTube streams. It helps foreign viewers better catch translations that other viewers are providing in the live chat. LiveTL does not automatically translate streams -- instead, it picks up translations found in the chat.

### I installed LiveTL but I don't see any buttons. 
Once you install the extension, you must reload the YouTube stream for LiveTL to take effect.

### I don't see any translations in the translations panel.
If there are no translators in chat, LiveTL is unable to provide translations. Any messages properly tagged with a language (ex. `[en]`, `ESP:`, etc.) will appear when they are available.

### Dark mode is broken!
Dark mode in LiveTL is currently controlled by the system theme. A toggle is coming soon!

### Banned translators, language settings, and panels are not being saved.
LiveTL currently does not have saved preferences. Stay tuned for an update in the very near future for settings saved across sessions!

### I want to reverse the order of translated messages or display translations as captions.
A toggle for translation order is coming soon, and caption mode is also in the works!

### I'm a Safari user, and I can't use the chat!
You must disable the `Prevent Cross-site tracking` option in safari privacy settings.

## Other Info

If you like LiveTL, don't forget to <a href="javascript:shareExtension();">share it with your friends</a>
and <a href="https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg">give
us a 5-star review</a>!

Please feel free to give us feedback or suggestions through the LiveTL Discord
server! [Here is the invite](https://discord.gg/uJrV3tmthg).
[![Discord](https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uJrV3tmthg)

Our code is completely open source on GitHub. We would appreciate if you could drop a
star! [Here is our repository](https://github.com/KentoNishi/LiveTL).

## Screenshots

### Open Stream in LiveTL

![](../img/livetlscreen.png)

### Hide Message / Ban Translator

![](../img/ban.png)

### Options

![](../img/options.png)

### Translator Selection

![](../img/translators.png)

### Pop Out LiveTL Chat

![](../img/popout.png)

<script>
    document.head.innerHTML += `
        <head>
            <link rel="icon" href="../favicon.ico" type="image/x-icon" />
        </head>
    `

    async function shareExtension() {
        let details = await (await fetch('https://kentonishi.github.io/LiveTL/LiveTL/manifest.json')).json()
        navigator.share({
            title: details.name,
            text: details.description,
            url: 'https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg',
        })
    }
</script>