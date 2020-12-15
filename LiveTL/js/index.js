params = parseParams();
let v = params.v || '5qap5aO4i9A';
let stream = document.querySelector('#stream');
let ltlchat = document.querySelector('#livetl-chat');
let chat = document.querySelector('#chat');
let leftPanel = document.querySelector('#leftPanel');
let bottomRightPanel = document.querySelector('#bottomRightPanel');
let topRightPanel = document.querySelector('#topRightPanel');
document.title = decodeURIComponent(params.title || "LiveTL");
let start = () => {
  stream.style.display = 'none';
  ltlchat.style.display = 'none';
  chat.style.display = 'none';
  leftPanel.style.backgroundColor = 'var(--accent)';
  bottomRightPanel.style.backgroundColor = 'var(--accent)';
  topRightPanel.style.backgroundColor = 'var(--accent)';
};
let stop = () => {
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


let r = params.isReplay;
r = r == null ? c : r;

window.addEventListener('message', d => {
  d = JSON.parse(JSON.stringify(d.data));
  try {
    chat.contentWindow.postMessage(d, "*");
    ltlchat.contentWindow.postMessage(d, "*");
  } catch (e) { }
});

let q = `?isReplay=${(r ? 1 : '')}&continuation=${c}&v=${v}`;

(async () => {
  let main = await getWAR('index.html');
  let pop = await getWAR('popout/index.html');
  ltlchat.src = `${pop}${q}&useLiveTL=1`;
  if (window.location.href.startsWith(main)) {
    ltlchat.src = `${pop}${q}&useLiveTL=1`;
  }
})();

chat.src = embedDomain + q;

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