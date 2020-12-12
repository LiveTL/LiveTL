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
document.title = decodeURIComponent(params.title || "LiveTL");
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
  localStorage.setItem('LTL:rightPanelHeight', topRightPanel.style.height);
  localStorage.setItem('LTL:leftPanelWidth', leftPanel.style.width);
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

window.addEventListener('message', d => {
  d = JSON.parse(JSON.stringify(d.data));
  try {
    chat.contentWindow.postMessage(d, "*");
    ltlchat.contentWindow.postMessage(d, "*");
  } catch (e) { }
});
if (c) {
  chat.src = `${embedDomain}?continuation=${c}`;
} else {
  chat.src = `${embedDomain}?v=${v}`;
}
ltlchat.src = `${chat.src}&useLiveTL=1`;

let leftWidth = localStorage.getItem('LTL:leftPanelWidth');

let rightHeight = localStorage.getItem('LTL:rightPanelHeight');

if (leftWidth) {
  leftPanel.style.width = leftWidth;
}
if (params.noVideo) {
  leftPanel.style.display = 'none';
} else {
  stream.src = `${embedDomain}?v=${v}&mode=video`;
  if (rightHeight) {
    topRightPanel.style.height = rightHeight;
  }
}