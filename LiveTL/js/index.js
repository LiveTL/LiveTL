parseParams = () => {
  const s = decodeURI(location.search.substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"');
  return s == '' ? {} : JSON.parse('{"' + s + '"}');
};

const v = parseParams().v || '5qap5aO4i9A';
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
chat.src = `https://kentonishi.github.io/LiveTL/embed?v=${v}&embed_domain=${document.domain}`;
stream.src = `https://www.youtube.com/embed/${v}?autoplay=1`;
ltlchat.src = `${chat.src}&useLiveTL=1`;
