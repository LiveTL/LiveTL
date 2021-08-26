document.body.innerHTML = '';
const script = document.createElement('script');
script.src = chrome.runtime.getURL('video_embed.bundle.js');
document.body.appendChild(script);
