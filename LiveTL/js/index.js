parseParams = () => {
  const s = decodeURI(location.search.substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"');
  return s == '' ? {} : JSON.parse('{"' + s + '"}');
};

const params = parseParams();
const v = params.v || '5qap5aO4i9A';
const stream = document.querySelector('#stream');
const ltlchat = document.querySelector('#livetl-chat');
const chat = document.querySelector('#chat');
const leftPanel = document.querySelector('#leftPanel');
const bottomRightPanel = document.querySelector('#bottomRightPanel');
const topRightPanel = document.querySelector('#topRightPanel');
const start = () => {
  stream.style.display = 'none';
  ltlchat.style.display = 'none';
  chat.style.display = 'none';
  leftPanel.style.backgroundColor = 'var(--accent)';
  bottomRightPanel.style.backgroundColor = 'var(--accent)';
  topRightPanel.style.backgroundColor = 'var(--accent)';
};
const stop = () => {
  stream.style.display = 'block';
  ltlchat.style.display = 'block';
  chat.style.display = 'block';
  leftPanel.style.backgroundColor = 'black';
  bottomRightPanel.style.backgroundColor = 'black';
  topRightPanel.style.backgroundColor = 'black';
};
$('#leftPanel').resizable({
  handles: {
    e: '#handleV'
  },
  start: start,
  stop: stop
});
$('#topRightPanel').resizable({
  handles: {
    s: '#handleH'
  },
  start: start,
  stop: stop
});
let c = params.continuation;
const embedDomain = EMBED_DOMAIN;
if (c) {
  chat.src = `${embedDomain}?continuation=${c}`;
  window.onmessage = d => {
    d = JSON.parse(JSON.stringify(d.data));
    chat.contentWindow.postMessage(d, "*");
    ltlchat.contentWindow.postMessage(d, "*");
  }
} else {
  chat.src = `${embedDomain}?v=${v}`;
}
stream.src = `${embedDomain}?v=${v}&mode=video`;
ltlchat.src = `${chat.src}&useLiveTL=1`;
