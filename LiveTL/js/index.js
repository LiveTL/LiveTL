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
const display = document.querySelector('#display');
let screenMode = '';
document.title = decodeURIComponent(params.title || 'LiveTL');
let INITIAL_PANEL_PERCENT = isAndroid ? 50 : 80;

// resizing yoinked and modified from https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
const getResizableElement = () => document.getElementById('videoPanel');

const setPaneWidth = (width) => {
  width = parseFloat(width);

  if (isNaN(width)) {
    return setPaneWidth(INITIAL_PANEL_PERCENT);
  }

  root.setProperty('--resizable-width', `${width}%`);
  if (screenMode == 'portrait') {
    $(videoPanel).css('height', `var(--resizable-width)`);
    $(videoPanel).css('width', `100%`);
  } else {
    $(videoPanel).css('width', `var(--resizable-width)`);
    $(videoPanel).css('height', `100%`);
  }
};

const setPaneHeight = (height) => {
  height = parseFloat(height);

  if (isNaN(height)) {
    return setPaneHeight(INITIAL_PANEL_PERCENT);
  }

  root.setProperty('--resizable-height', `${height}%`);
};

let chatSide;

const getPaneWidth = () => {
  let pxWidth = videoPanel.clientWidth;
  let result = 100 * pxWidth / display.clientWidth;
  if (screenMode == 'portrait') {
    pxWidth = videoPanel.clientHeight;
    result = 100 * pxWidth / display.clientHeight;
  }
  return isNaN(result) ? INITIAL_PANEL_PERCENT : Math.min(100, Math.max(result, 0));
};

const getPaneHeight = () => {
  let pxHeight = youtubeChatPanel.clientHeight;
  let result = 100 * pxHeight / liveTLPanel.clientHeight;
  return isNaN(result) ? INITIAL_PANEL_PERCENT : Math.min(100, Math.max(result, 0));
};

let c = params.continuation;
let r = params.isReplay;
r = r == null ? c : r;

let zoomObj = {};

let setStreamZoom = () => {
  if (isAndroid) {
    let s = stream.contentWindow.document.body.style;
    s.transformOrigin = '0px 0px';
    s.width = zoomObj.width;
    s.height = zoomObj.height;
    s.transform = zoomObj.transform;
    s.overflow = 'hidden';
  }
};

window.addEventListener('message', d => {
  d = JSON.parse(JSON.stringify(d.data));

  chat.contentWindow.postMessage(d, '*');
  if (d.type == 'zoom') {
    zoomObj = d.zoom;
    document.querySelectorAll('.captionSegment').forEach(styleCaptionSegment);
    setStreamZoom();
  } else if (d.type == 'getInitData') {
    chat.contentWindow.postMessage({
      type: 'zoom',
      zoom: zoomObj
    }, '*');
    chat.contentWindow.postMessage({
      'yt-live-chat-set-dark-theme': true
    }, '*');
    setStreamZoom();
  }

  d.video = params.v;
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
  setPaneWidth(INITIAL_PANEL_PERCENT);
  // setPaneWidth(Math.round(window.innerWidth * 0.8));
}

if (rightHeight) {
  setPaneHeight(parseFloat(rightHeight));
} else {
  setPaneHeight(INITIAL_PANEL_PERCENT);
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
  getCaptionZoom().then(zoom => {
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
  const width = getPaneWidth();
  const height = getPaneHeight();
  if (!isNaN(width) && !params.noVideo) {
    localStorage.setItem('LTL:leftPanelWidth', width.toString() + '%');
  }
  if (!isNaN(height) && !params.noVideo) {
    localStorage.setItem('LTL:rightPanelHeight', height.toString() + '%');
    setPaneHeight(getPaneHeight());
  }
  if (screenMode != 'portrait') {
    videoPanel.style.width = null;
  }
  youtubeChatPanel.style.height = null;
};

let stopFunc = () => {
  setPaneWidth(getPaneWidth());
  setPaneHeight(getPaneHeight());
  stop();
};

let leftHandle = document.querySelector('#leftHandle');
let rightHandle = document.querySelector('#rightHandle');
let verticalHandle;
let horizontalHandle;

window.sideChanged = async (side) => {
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
  let horizontalHandleCode = `
    <div class="handle handleH ui-resizable-handle ui-resizable-s">
      <span>&hellip;</span>
    </div>
  `;
  verticalHandle = document.createElement('span');
  verticalHandle.innerHTML = `
    <div id="handleV" 
      class="handle ui-resizable-handle ui-resizable-e">
      <span>&vellip;</span>
    </div>
  `;
  chatSide = await getStorage('chatSide');
  side = side || 'right';
  let handleObj = { e: $(verticalHandle) };
  if (screenMode == 'portrait') {
    verticalHandle = document.createElement('span');
    verticalHandle.innerHTML = horizontalHandleCode;
    videoPanel.style.height = `var(--resizable-width)`;
    videoPanel.style.width = `100%`;
    videoPanel.style.maxHeight = '100%';
    verticalHandle.querySelector('.handle').style.zIndex = `3`;
    youtubeChatPanel.style.height = 'min(var(--resizable-height), calc(100% - var(--resizable-width)))';
    handleObj = { s: $(verticalHandle) };
    chatSide = 'right';
  } else {
    videoPanel.style.width = `var(--resizable-width)`;
    videoPanel.style.height = `100%`;
    videoPanel.style.maxHeight = 'unset';
    youtubeChatPanel.style.height = 'var(--resizable-height)';
    verticalHandle.querySelector('.handle').style.zIndex = `2`;
  }
  $(stream).css('max-width', '100%');
  $(stream).css('max-height', '100%');
  if (side === 'right') {
    leftHandle.appendChild(verticalHandle);
    videoPanel.style.order = '1';
    liveTLPanel.style.order = '2';
    videoPanel.style.minWidth = '10px';
    $(liveTLPanel).css('width', 'unset');
    $(liveTLPanel).css('flex-grow', '1');
    $(youtubeChatPanel).css('max-width', '100%');
    $(outputPanel).css('max-width', '100%');
    if (screenMode != 'portrait') {
      $(stream).css('max-width', 'calc(100% - 10px)');
    } else {
      $(stream).css('max-height', 'calc(100% - 10px)');
    }
  } else if (side === 'left') {
    rightHandle.appendChild(verticalHandle);
    videoPanel.style.order = '2';
    liveTLPanel.style.order = '1';
    videoPanel.style.minWidth = '0px';
    $(liveTLPanel).css('flex-grow', 0);
    $(liveTLPanel).css('width', '100%');
    $(youtubeChatPanel).css('max-width', 'calc(100% - 10px)');
    $(outputPanel).css('max-width', 'calc(100% - 10px)');
    $(stream).css('max-width', '100%');
  }
  $(side == 'left' ? liveTLPanel : videoPanel).resizable({
    handles: handleObj,
    start: start,
    stop: stopFunc,
    resize: (event, ui) => {
      if (chatSide == 'left') {
        let newWidth = window.innerWidth - ui.size.width;
        $(videoPanel).css('width', newWidth + 'px');
        root.setProperty('--resizable-width', newWidth + 'px');
      }
    },
    containment: '#display'
  });
  horizontalHandle = document.createElement('span');
  horizontalHandle.innerHTML = horizontalHandleCode;
  horizontalHandle.id = 'handleH';
  youtubeChatPanel.appendChild(horizontalHandle);
  $(youtubeChatPanel).resizable({
    handles: {
      s: $(horizontalHandle)
    },
    start: start,
    stop: stop,
    containment: '#ltlPanel'
  });
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
};
getStorage('chatSide').then(async (side) => {
  if (side != 'right' && side != 'left') await setStorage('chatSide', 'right');
  await window.sideChanged(side);
});

window.orientationChanged = async mode => {
  screenMode = mode;
  display.style.flexDirection = screenMode == 'portrait' ? 'column' : 'row';
  await window.sideChanged(screenMode == 'portrait' ? 'right' : await getStorage('chatSide'));
};

window.onAndroidOrientationChange = async (orientation) => {
  let doc = ltlchat.contentWindow.document;
  let radio;
  if (orientation == 'portrait') {
    radio = doc.querySelector("#chatSidePortrait");
  } else {
    radio = doc.querySelector("#chatSide" + (await getStorage('chatSide') == 'left' ? 'Left' : 'Right'));
  }
  radio.checked = true;
  radio.dispatchEvent(new Event('change'));
};

getTopWithSafety = d => `max(min(${d}, calc(100% - 50px)), -50px)`;
getLeftWithSafety = d => `max(min(${d}, calc(100% - 50px)), -50px)`;


let capLeft = localStorage.getItem('LTL:captionSizeLeft');
let capTop = localStorage.getItem('LTL:captionSizeTop');
let capWidth = localStorage.getItem('LTL:captionSizeWidth');
if (capLeft) nojdiv.style.left = propToPercent(getLeftWithSafety(capLeft), false);
if (capTop) nojdiv.style.top = getTopWithSafety(propToPercent(capTop, true));
if (capWidth) nojdiv.style.width = propToPercent(capWidth, false);
// else if (isAndroid) nojdiv.style.width = '50%';

$(captionsDiv).draggable({
  stop: (event, ui) => {
    let top = getTop(ui.helper);
    ui.helper.css('position', 'fixed');
    top = parseFloat(propToPercent(top, true), 10);
    let topp = `${top}%`;
    ui.helper.css('top', topp);
    let width = parseFloat(propToPercent(nojdiv.style.width, false));
    let left = parseFloat(propToPercent(nojdiv.style.left, false));
    let sum = left + width;
    let percent = `${width}%`;
    left = `${left}%`;
    ui.helper.css('width', propToPercent(percent, false));
    ui.helper.css('left', left);
    localStorage.setItem('LTL:captionSizeWidth', percent);
    localStorage.setItem('LTL:captionSizeLeft', left);
    localStorage.setItem('LTL:captionSizeTop', topp);
  },
  containment: '#bounding'
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
    ltlchat.contentWindow.Android.toggleFullScreen();
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
