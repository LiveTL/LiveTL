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
const root = document.documentElement.style;
document.title = decodeURIComponent(params.title || 'LiveTL');

// resizing yoinked and modified from https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
const getResizableElement = () => document.getElementById('videoPanel');

const setPaneWidth = (width) => {
  if (isNaN(width)) {
    return setPaneWidth(80);
  }

  width = parseFloat(width);
  root.setProperty('--resizable-width', `${width}%`);
  root.setProperty('width', `var(--resizable-width)`);
};

let chatSide;
const getPaneWidth = () => {
  let pxWidth = videoPanel.clientWidth;
  let result = 100 * pxWidth / window.innerWidth;
  return result == NaN ? 80 : Math.min(100, Math.max(result, 0));
};



let c = params.continuation;
let r = params.isReplay;
r = r == null ? c : r;

let zoomObj = {};

window.addEventListener('message', d => {
  d = JSON.parse(JSON.stringify(d.data));

  chat.contentWindow.postMessage(d, '*');
  if (d.type == 'zoom') {
    zoomObj = d.zoom;
    document.querySelectorAll('.captionSegment').forEach(styleCaptionSegment);
  } else if (d.type == 'getInitData') {
    chat.contentWindow.postMessage({
      type: 'zoom',
      zoom: zoomObj
    }, '*');
    chat.contentWindow.postMessage({
      'yt-live-chat-set-dark-theme': true
    }, '*');
  }

  ltlchat.contentWindow.postMessage(d, '*');
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
  styleCaptionSegment(caption);
  // May add animations later
  caption.removeSelf = () => {
    caption.remove();
  };
  return caption;
}

function styleCaptionSegment(caption) {
  getStorage('zoom').then(zoom => {
    if (zoom) caption.style.fontSize = `${20 * zoom}px`;
  });
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
  let delay = await getStorage('captionDelay');
  if (displayCaptions && event.data.action === 'caption') {
    displayCaption(event.data.caption, delay > 0 ? delay * 1000 : -1);
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
  videoPanel.style.width = null;
};

let stopFunc = () => {
  setPaneWidth(getPaneWidth());
  stop();
};

let leftHandle = document.querySelector('#leftHandle');
let rightHandle = document.querySelector('#rightHandle');
let verticalHandle;
let horizontalHandle;

window.sideChanged = async side => {
  if (verticalHandle) verticalHandle.remove();
  if (horizontalHandle) horizontalHandle.remove();
  try {
    $(liveTLPanel).resizable('destroy');
  } catch { }
  try {
    $(videoPanel).resizable('destroy');
  } catch { }
  try {
    $(youtubeChatPanel).resizable('destroy');
  } catch { }
  verticalHandle = document.createElement('span');
  verticalHandle.innerHTML = `
    <div id="handleV" 
      class="handle ui-resizable-handle ui-resizable-e">
      <span>&vellip;</span>
    </div>
  `;
  chatSide = await getStorage('chatSide');
  side = side || 'right';
  let handleSide = {};
  if (side === 'right') {
    leftHandle.appendChild(verticalHandle);
    videoPanel.style.order = '1';
    liveTLPanel.style.order = '2';
    videoPanel.style.minWidth = '10px';
    $(liveTLPanel).css('width', 'unset');
    $(youtubeChatPanel).css('max-width', '100%');
    $(outputPanel).css('max-width', '100%');
  } else if (side === 'left') {
    rightHandle.appendChild(verticalHandle);
    videoPanel.style.order = '2';
    liveTLPanel.style.order = '1';
    videoPanel.style.minWidth = '0px';
    $(youtubeChatPanel).css('max-width', 'calc(100% - 10px)');
    $(outputPanel).css('max-width', 'calc(100% - 10px)');
  }
  $(side == 'left' ? liveTLPanel : videoPanel).resizable({
    handles: { e: $(verticalHandle) },
    start: start,
    stop: stopFunc,
    resize: (event, ui) => {
      if (chatSide == 'left') {
        let newWidth = window.innerWidth - ui.size.width;
        $(videoPanel).css('width', newWidth + 'px');
        root.setProperty('--resizable-width', newWidth + 'px');
      }
    }
  });
  horizontalHandle = document.createElement('span');
  horizontalHandle.innerHTML = `
    <div id="handleH" 
      class="handle ui-resizable-handle ui-resizable-s">
      <span>&hellip;</span>
    </div>
  `;
  youtubeChatPanel.appendChild(horizontalHandle);
  $(youtubeChatPanel).resizable({
    handles: {
      s: $(horizontalHandle)
    },
    start: start,
    stop: stop
  });
};
getStorage('chatSide').then(async (side) => {
  await window.sideChanged(side);
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
  if (isAndroid) {
    window.Android.toggleFullScreen();
  } else {
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
}
