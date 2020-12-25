params = parseParams();
const v = params.v || '5qap5aO4i9A';
const stream = document.querySelector('#stream');
const leftPanelContainer = document.querySelector('#videoPanel');
const ltlchat = document.querySelector('#livetl-chat');
const chat = document.querySelector('#chat');
const videoPanel = document.querySelector('#videoPanel');
const liveTLPanel = document.querySelector('#ltlPanel');
const outputPanel = document.querySelector('#outputPanel');
const youtubeChatPanel = document.querySelector('#youtubeChatPanel');
document.title = decodeURIComponent(params.title || 'LiveTL');

// resizing yoinked and modified from https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
const getResizableElement = () => document.getElementById('videoPanel');

const setPaneWidth = (width) => {
  if (isNaN(width)) {
    return setPaneWidth(80);
  }

  width = parseFloat(width);
  getResizableElement().style
    .setProperty('--resizable-width', `${width}%`);
  getResizableElement().style
    .setProperty('width', `var(--resizable-width)`);
};

const getPaneWidth = () => {
  const pxWidth = videoPanel.clientWidth;
  let result = 100 * pxWidth / window.innerWidth;
  return result == NaN ? 80 : Math.min(100, Math.max(result, 0));
};



let c = params.continuation;
let r = params.isReplay;
r = r == null ? c : r;

let progress = {
  current: null,
  previous: null
};

let queued = new class QueuedMessages {
  next = null
  messages = {}
  push (message, secs) {
    if (!this.next) this.next = secs;
    if (!this.messages[secs]) this.messages[secs] = [];
    this.messages[secs].push(message);
  }
  pop (secs) {
    if (!this.next || secs < this.next) return false;
    let m = [...this.messages[this.next]];
    delete this.messages[this.next];
    this.next = Object.keys(this.messages)[0]; // Assume order
    return m;
  }
  clear () {
    this.messages = {};
    this.next = null;
  }
}

window.addEventListener('message', d => {
  d = JSON.parse(JSON.stringify(d.data));

  try {
    chat.contentWindow.postMessage(d, '*');
  } catch {}

  if (params.isReplay) {
    // Enable queued message transfer
    // Dont block
    setTimeout(() => {
      if (d['yt-player-video-progress']) {
        progress.current = d['yt-player-video-progress'];
        if (!progress.previous) progress.previous = progress.current;
        if (Math.abs(progress.previous - progress.current) > 1) {
          // Difference in progress above a second, assume user scrubbed, clear.
          queued.clear();
        }
        // Find queued messages for current timeframe
        let m = queued.pop(progress.current);
        if (m) {
          ltlchat.contentWindow.postMessage({
            type: 'messageChunk',
            messages: m,
            video: v
          }, '*');
        }
        progress.previous = progress.current;
      } else if (d.type === 'messageChunk') {
        d.messages = d.messages.filter(message => {
          let secs = Array.from(message.timestamp.split(':'), t => parseInt(t)).reverse();
          secs = secs[0] + (secs[1] ? secs[1] * 60 : 0)
                         + (secs[2] ? secs[2] * 60*60 : 0);

          let diff = progress.current - secs;
          if (diff < 0) { // Message from the future ✨🔮, queue
            queued.push(message, secs);
            return false; // Remove from original event
          } else return true;
        });

        // Send past and current messages
        ltlchat.contentWindow.postMessage(d, '*');
      }
    }, 0);
  } else {
    ltlchat.contentWindow.postMessage(d, '*');
  }
});

let q = `?isReplay=${(r ? 1 : '')}&v=${v}${(c ? `&continuation=${c}` : '')}`;

(async () => {
  let main = await getWAR('index.html');
  let pop = await getWAR('popout/index.html');
  ltlchat.src = `${pop}${q}&useLiveTL=1&isReplay=${(r ? 1 : '')}`;
  if (window.location.href.startsWith(main)) {
    ltlchat.src = `${pop}${q}&useLiveTL=1`;
  }
})();

chat.src = embedDomain + q;

let leftWidth = localStorage.getItem('LTL:leftPanelWidth');
let rightHeight = localStorage.getItem('LTL:rightPanelHeight');

if (leftWidth) {
  setPaneWidth(parseFloat(leftWidth));
} else {
  setPaneWidth(80);
  // setPaneWidth(Math.round(window.innerWidth * 0.8));
}

if (params.noVideo) {
  videoPanel.style.display = 'none';
  document.querySelectorAll('#handleV').style.display = 'none';
} else {
  stream.src = `${embedDomain}?v=${v}&mode=video`;
  if (rightHeight) {
    youtubeChatPanel.style.height = rightHeight;
  }
}

function createCaptionSegment(segment) {
  let caption = document.createElement('p');
  caption.className = 'captionSegment';
  caption.textContent = segment;
  // May add animations later
  caption.removeSelf = () => {
    caption.remove();
  };
  return caption;
}

// Just here in case we need it later
function splitCaptionIntoSegments(caption, maxLength = 100) {
  return [caption];
}

function displayCaption(caption, persistFor = -1, clear = true) {
  const captions = document.querySelector('#ltlcaptions');
  captions.style.display = 'inline-table';
  if (clear) {
    clearCaptions();
  }
  splitCaptionIntoSegments(caption)
    .map(createCaptionSegment)
    .map(caption => {
      captions.appendChild(caption);
      if (persistFor >= 0) {
        setTimeout(() => caption.removeSelf(), persistFor);
      }
    });
}

function clearCaptions() {
  const captions = document.querySelector('#ltlcaptions');
  captions.querySelectorAll('.captionSegment').forEach(node => node.remove());
}

window.addEventListener('message', async (event) => {
  let displayCaptions = await getStorage('captionMode');
  if (displayCaptions && event.data.action === 'caption') {
    displayCaption(event.data.caption);
  }
  if (event.data.action === 'clearCaption') {
    clearCaptions();
  }
  if (event.data.type == 'fullscreen') toggleFullScreen();
});

// Demo call to displayCaption
// displayCaption("Oi koroneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneoneone", 1000, false);

let nojdiv = document.querySelector('#ltlcaptions');
let captionsDiv = document.querySelector('#ltlcaptions');
$(captionsDiv).resizable({
  handles: 'e, w',
  stop: (event, ui) => {
    var top = getTop(ui.helper);
    ui.helper.css('position', 'fixed');
    let width = parseFloat(propToPercent(nojdiv.style.width, false));
    let left = parseFloat(propToPercent(nojdiv.style.left, false));
    let percent = `${left + width > 100 ? 100 - left : width}%`;
    ui.helper.css('width', percent);
    localStorage.setItem('LTL:captionSizeWidth', percent);
  }
});

const start = () => {
  stream.style.display = 'none';
  captionsDiv.style.display = 'none';
  ltlchat.style.display = 'none';
  chat.style.display = 'none';
  videoPanel.style.backgroundColor = 'var(--accent)';
  outputPanel.style.backgroundColor = 'var(--accent)';
  youtubeChatPanel.style.backgroundColor = 'var(--accent)';
};
const stop = () => {
  stream.style.display = 'block';
  captionsDiv.style.display = 'inline-table';
  ltlchat.style.display = 'block';
  chat.style.display = 'block';
  videoPanel.style.backgroundColor = 'black';
  outputPanel.style.backgroundColor = 'black';
  youtubeChatPanel.style.backgroundColor = 'black';
  localStorage.setItem('LTL:rightPanelHeight', youtubeChatPanel.style.height);
  const width = getPaneWidth();
  if (isNaN(width) === false && !params.noVideo) {
    localStorage.setItem('LTL:leftPanelWidth', width.toString() + '%');
  }
};

$('#youtubeChatPanel').resizable({
  handles: {
    s: '#handleH'
  },
  start: start,
  stop: stop
});

let stopFunc = () => {
  setPaneWidth(getPaneWidth());
  stop();
};

let leftHandle = document.querySelector('#leftHandle');
let rightHandle = document.querySelector('#rightHandle');
let handle = document.createElement('span');
handle.innerHTML = `<div id="handleV" class="handle ui-resizable-handle ui-resizable-e"><span>&vellip;</span></div>`;

getStorage('chatSide').then(side => {
  try {
    $(videoPanel).resizable('disable');
  } catch (e) { }
  side = side || 'right';
  if (side === 'right') {
    leftHandle.appendChild(handle);
    videoPanel.style.order = '1';
    liveTLPanel.style.order = '2';
  } else if (side === 'left') {
    leftHandle.appendChild(handle);
    videoPanel.style.order = '2';
    liveTLPanel.style.order = '1';
  }
  $(videoPanel).resizable({
    handles: {
      e: $('#handleV')
    },
    start: start,
    stop: stopFunc
  });
});

getTopWithSafety = d => `max(min(${d}, calc(100% - 50px)), -30px)`;
getLeftWithSafety = d => `max(min(${d}, calc(100% - 50px)), -30px)`;


let capLeft = localStorage.getItem('LTL:captionSizeLeft');
let capTop = localStorage.getItem('LTL:captionSizeTop');
let capWidth = localStorage.getItem('LTL:captionSizeWidth');
if (capLeft) nojdiv.style.left = propToPercent(getLeftWithSafety(capLeft), false);
if (capTop) nojdiv.style.top = getTopWithSafety(propToPercent(capTop, true));
if (capWidth) nojdiv.style.width = propToPercent(capWidth, false);

$(captionsDiv).draggable({
  stop: (event, ui) => {
    let top = getTop(ui.helper);
    ui.helper.css('position', 'fixed');
    top = parseFloat(propToPercent(top, true), 10);
    // top = top < 0 ? 0 : top;
    // top = top > 100 ? 100 : top;
    let topp = `${top}%`;
    ui.helper.css('top', getTopWithSafety(topp));
    let width = parseFloat(propToPercent(nojdiv.style.width, false));
    let left = parseFloat(propToPercent(nojdiv.style.left, false));
    // left = left < 0 ? 0 : left;
    let sum = left + width;
    let percent = `${sum > 100 ? 100 - left : width}%`;
    left = `${left}%`;
    ui.helper.css('width', propToPercent(percent, false));
    ui.helper.css('left', getLeftWithSafety(left));
    localStorage.setItem('LTL:captionSizeWidth', percent);
    localStorage.setItem('LTL:captionSizeLeft', left);
    localStorage.setItem('LTL:captionSizeTop', topp);
  }
});


function getTop(ele) {
  var eTop = ele.offset().top;
  var wTop = $(window).scrollTop();
  var top = eTop - wTop;
  return top;
}

function propToPercent(prop, top = true) {
  prop = `${prop}`;
  if (prop.includes('%')) {
    return prop;
  }
  let value = parseFloat(prop, 10);
  let divBy = window.innerWidth;
  if (top) {
    divBy = window.innerHeight;
  }
  return `${100 * value / divBy}%`;
}

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
    (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}