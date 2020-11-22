runLiveTL = () => {
    console.log("Running LiveTL!");
    var e = document.querySelectorAll("#items")[1];
    document.querySelectorAll("#items")[0].style.display = "none";
    document.querySelectorAll("#panel-pages")[0].style.display = "none";
    e.style.position = "fixed";
    e.style.top = 0;
    e.style.left = 0;
    e.style.maxHeight = "100vh";
    e.style.maxWidth = "100vw";
    e.style.overflowY = "hidden";
    e.style.zIndex = "69420";
    e.style.backgroundColor = "var(--yt-live-chat-background-color)";
    e.scrollTop = e.scrollHeight;
    var style = document.createElement('style');
    style.innerHTML = `
        yt-img-shadow {
            display: none !important;
            width: 0px !important;
        }
        yt-live-chat-text-message-renderer > #content > * {
            display:none;
        }
        yt-live-chat-text-message-renderer > #content > #message {
            display: block !important;
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);
    setInterval(() => {
        e.scrollTop = e.scrollHeight;
    }, 0);
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