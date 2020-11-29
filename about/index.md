# Getting Started with LiveTL

<span id="actionMessage">
You must have the <a href="https://kentonishi.github.io/LiveTL">LiveTL extension</a> installed to use LiveTL features.
</span>

## Launching LiveTL

To get started, visit your favorite streamer on YouTube. The chat should have some new buttons for launching LiveTL!

![](../img/openlivetl.png)

Alternatively, you can open LiveTL from within HoloTools!

![](../img/holotoolslauncher.png)

## Other Info
If you like LiveTL, don't forget to <a href="javascript:shareExtension();">share it with your friends</a> and <a href="https://kentonishi.github.io/LiveTL">give us a 5-star review</a>!

Please feel free to give us feedback or suggestions through the LiveTL Discord server! [Here is the invite](https://discord.gg/uJrV3tmthg).
[![Discord](https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uJrV3tmthg)

Our code is completely open source on GitHub. We would appreciate if you could drop a star! [Here is our repository](https://github.com/KentoNishi/LiveTL).

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
    `;

    async function shareExtension() {
        let details = await (await fetch("https://kentonishi.github.io/LiveTL/LiveTL/manifest.json")).json();
        navigator.share({
            title: details.name,
            text: details.description,
            url: "https://kentonishi.github.io/LiveTL",
        });
    }
</script>