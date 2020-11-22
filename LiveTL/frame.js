runLiveTL = () => {
    console.log("Running LiveTL!");
    var style = document.createElement('style');
    style.innerHTML = `
        .livetl {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--yt-live-chat-background-color);
            color: var(--yt-live-chat-primary-text-color);
            z-index: 69420;
            word-wrap: break-word;
            word-break: break-word;
            font-size: 20px;
            overflow: hidden;
            padding-left: 10px;
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);
    var e = document.createElement("div");
    e.className = "livetl";
    document.body.appendChild(e);

    var lastElement = null;
    setInterval(() => {
        var messages = document.querySelectorAll("#message");
        for (i = messages.length - 1; i >= 0; i--) {
            var m = messages[i];
            if (!m.innerText) continue;
            if (m == lastElement) break;;
            // match lang with regex here
            var line = document.createElement("div");
            line.style.marginBottom = "10px";
            line.innerText = m.innerText;
            e.appendChild(line);
            e.scrollTop = e.scrollHeight;
        }
        lastElement = messages[messages.length - 1];
    }, 100);
}

window.onload = () => {
    if (parent === top) {
        try {
            var params = JSON.parse('{"' +
                decodeURI(location.search.substring(1))
                    .replace(/"/g, '\\"')
                    .replace(/&/g, '","')
                    .replace(/=/g, '":"')
                + '"}');
            if (params.useLiveTL) {
                runLiveTL();
            }
        } catch (e) {
        }
    }
};