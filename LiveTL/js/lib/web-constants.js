export const isFirefox = !!/Firefox/.exec(navigator.userAgent);

export const isAndroid = window.isAndroid || (window.chrome == null && !isFirefox);

window.isAndroid = isAndroid;

export function parseParams(loc) {
  try {
    const url = new URL(loc || location.href);
    return Object.fromEntries(new URLSearchParams(url.search));
  } catch (e_) {
    return parseParamsLegacy(loc);
  }
}

function parseParamsLegacy(loc) {
  const s = decodeURI((loc || location.search).substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"');
  return s === '' ? {} : JSON.parse('{"' + s + '"}');
}

export const speechSynthDefault = false;
