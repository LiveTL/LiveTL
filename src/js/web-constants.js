/**
 * Constants that depend on browser js apis
 */

// Js enum omegalul
/** @enum {number} */
export const Browser = {
  FIREFOX: 0,
  CHROME: 1,
  SAFARI: 2,
  ANDROID: 3
};

export const BROWSER = (() => {
  if (/Firefox/.exec(navigator.userAgent)) {
    return Browser.FIREFOX;
  }
  if (window.isAndroid || window.chrome == null) {
    return Browser.ANDROID;
  }
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    return Browser.SAFARI;
  }
  return Browser.CHROME;
})();