parseParams = () => {
    var s = decodeURI(location.search.substring(1))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
    return s == "" ? {} : JSON.parse('{"' + s + '"}');
}

var v = parseParams().v || "5qap5aO4i9A";
var stream = document.querySelectorAll("#stream")[0];
var ltlchat = document.querySelectorAll("#livetl-chat")[0];
var chat = document.querySelectorAll("#chat")[0];
var leftPanel = document.querySelectorAll("#leftPanel")[0];
var rightPanel = document.querySelectorAll("#rightPanel")[0];
var sidePanel = document.querySelectorAll("#sidePanel")[0];
var start = () => {
    stream.style.display = "none";
    ltlchat.style.display = "none";
    chat.style.display = "none";
    leftPanel.style.backgroundColor = "var(--accent)";
    rightPanel.style.backgroundColor = "var(--accent)";
    sidePanel.style.backgroundColor = "var(--accent)";
};
var stop = () => {
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