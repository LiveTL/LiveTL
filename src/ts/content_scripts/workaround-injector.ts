document.body.innerHTML = '';
const script = document.createElement('script');
script.src = chrome.runtime.getURL('/ts/yt-workaround.js');
document.body.appendChild(script);

export {};
