for (const eventName of ['visibilitychange', 'webkitvisibilitychange', 'blur']) {
  window.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
}

const styleLiveTLButton = (a, color) => {
  a.style.backgroundColor = `${color || 'rgb(0, 153, 255)'}`;
  a.style.font = 'inherit';
  a.style.fontSize = '11px';
  a.style.fontWeight = 'bold';
  a.style.width = '100%';
  a.style.margin = 0;
  a.style.textAlign = 'center';
};
  
const setLiveTLButtonAttributes = (a) => {
  [
    'yt-simple-endpoint',
    'style-scope',
    'ytd-toggle-button-renderer'
  ].forEach(c => a.classList.add(c));
  a.tabindex = '-1';
};

const getLiveTLButton = (color) => {
  const a = document.createElement('a');
  setLiveTLButtonAttributes(a);
  styleLiveTLButton(a, color);
  a.innerHTML = `
  <paper-button id="button" class="style-scope ytd-toggle-button-renderer livetlActivator" role="button" tabindex="0" animated=""
  elevation="0" aria-disabled="false" style="
    padding: 5px;
    width: 100%;
    margin: 0;
  ">
    <yt-formatted-string id="text" class="style-scope ytd-toggle-button-renderer">
    </yt-formatted-string>
    <paper-ripple class="style-scope paper-button">
      <div id="background" class="style-scope paper-ripple" style="opacity: 0.00738;"></div>
      <div id="waves" class="style-scope paper-ripple"></div>
    </paper-ripple>
    <paper-ripple class="style-scope paper-button">
      <div id="background" class="style-scope paper-ripple" style="opacity: 0.007456;"></div>
      <div id="waves" class="style-scope paper-ripple"></div>
    </paper-ripple>
    <paper-ripple class="style-scope paper-button">
      <div id="background" class="style-scope paper-ripple" style="opacity: 0.007748;"></div>
      <div id="waves" class="style-scope paper-ripple"></div>
    </paper-ripple>
  </paper-button>
  `;
  return a;
};

const makeButton = (text, callback, color='rgb(0, 153, 255)') => {
  let a = document.createElement('span');
  a.appendChild(getLiveTLButton(color));
  const e = document.querySelector('#input-panel');
  e.appendChild(a);
  a.querySelector('a').addEventListener('click', callback);
  a.querySelector('yt-formatted-string').textContent = text;
};

window.addEventListener('load', () => {
  const elem = document.querySelector('yt-live-chat-app');
  elem.style.minWidth = '0px';
  elem.style.minHeight = '0px';
  elem.style.maxWidth = undefined;
  elem.style.maxHeight = undefined;
  try{
    const insertButtons = () => {
      const params = new URLSearchParams(window.location.search);
      params.get('embed_domain') || window.parent.location.href;
      makeButton('Watch in LiveTL', () => {
        params.set('video', (params.get('v') ||
          new URLSearchParams(window.parent.location.search).get('v')
        ));
        if(window.location.pathname.includes('live_chat_replay')) params.set('isReplay', true);
        // eslint-disable-next-line no-undef
        window.top.location = `chrome-extension://${chrome.runtime.id}/watch.html?${params.toString()}`;
      });
    };
    insertButtons();
    setInterval(()=>{
      if(document.querySelector('.livetlActivator')) return;
      insertButtons();
    }, 100);
  // eslint-disable-next-line no-empty
  } catch(e) {
  }
});

window.addEventListener('message', packet=>{
  if (packet.origin !== window.origin) window.postMessage(packet.data);
});