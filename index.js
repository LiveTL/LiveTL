parseParams = () => {
    let s = decodeURI(location.search.substring(1))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
    return s == "" ? {} : JSON.parse('{"' + s + '"}');
}

let v = parseParams().v || "5qap5aO4i9A";
let stream = document.querySelector("#stream");
let ltlchat = document.querySelector("#livetl-chat");
let chat = document.querySelector("#chat");
let leftPanel = document.querySelector("#leftPanel");
let rightPanel = document.querySelector("#rightPanel");
let sidePanel = document.querySelector("#sidePanel");
let start = () => {
    stream.style.display = "none";
    ltlchat.style.display = "none";
    chat.style.display = "none";
    leftPanel.style.backgroundColor = "let(--accent)";
    rightPanel.style.backgroundColor = "let(--accent)";
    sidePanel.style.backgroundColor = "let(--accent)";
};
let stop = () => {
    stream.style.display = "block";
    ltlchat.style.display = "block";
    chat.style.display = "block";
    leftPanel.style.backgroundColor = "black";
    rightPanel.style.backgroundColor = "black";
    sidePanel.style.backgroundColor = "black";
};
$("#leftPanel").resizable({
    handles: {
        "e": "#handleV"
    }, start: start, stop: stop
});
$("#sidePanel").resizable({
    handles: {
        "s": "#handleH"
    }, start: start, stop: stop
});
chat.src = `https://www.youtube.com/live_chat?v=${v}&embed_domain=${document.domain}`;
stream.src = `https://www.youtube.com/embed/${v}?autoplay=1`;
ltlchat.src = `${chat.src}&useLiveTL=1`;
