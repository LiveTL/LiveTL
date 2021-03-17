// Js enum omegalul
export const Browser = {
  FIREFOX: 0,
  CHROME: 1,
  SAFARI: 2,
  ANDROID: 3,
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

export const storage = new Storage();

function Storage() {
  switch (BROWSER) {
  case Browser.ANDROID:
    this.get = async key => {
      let data = {};
      try {
        data[key] = JSON.parse(localStorage[key]);
      } catch (e) {
        data[key] = localStorage[key];
      }
      return data;
    };

    this.set = async obj => {
      let key = Object.keys(obj)[0];
      localStorage[key] = JSON.stringify(obj[key]);
    };
    break;
  case Browser.FIREFOX:
    this.get = async (key) => {
    // eslint-disable-next-line no-undef
      return await browser.storage.local.get(key);
    };

    this.set = async (obj) => {
    // eslint-disable-next-line no-undef
      return await browser.storage.local.set(obj);
    };
    break;
  default:
    this.get = (key) => {
      return new Promise((res) => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.get(key, res);
      });
    };

    this.set = (obj) => {
      return new Promise((res) => {
      // eslint-disable-next-line no-undef
        chrome.storage.local.set(obj, res);
      });
    };
  }
}