export const isFirefox = !!/Firefox/.exec(navigator.userAgent);

export const isAndroid = window.isAndroid || (window.chrome == null && !isFirefox);

window.isAndroid = isAndroid;
