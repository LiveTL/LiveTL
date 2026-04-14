// YouTube's `/error?...` pages now enforce Trusted Types in Chromium.
// Avoid `innerHTML` so the workaround injector still runs.
while (document.body.firstChild) {
  document.body.removeChild(document.body.firstChild);
}
const script = document.createElement('script');
script.src = chrome.runtime.getURL('/ts/yt-workaround.js');
document.body.appendChild(script);

export {};
