document.body.innerHTML = '';
const script = document.createElement('script');
script.src = chrome.runtime.getURL('yt-workaround.bundle.js');
document.body.appendChild(script);

export {};
