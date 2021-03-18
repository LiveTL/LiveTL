import { get, writable } from 'svelte/store';
import { Browser, BROWSER } from './web-constants.js';

export const storage = new Storage();

export class SettingStore {
  constructor(name, defaultValue) {
    this.name = name;
    this.defaultValue = defaultValue;
    const store = writable(defaultValue);
    this._store = store;
    getStorage(name).then(value => {
      if (value != null) {
        store.set(value);
      }
    });
  }

  get() {
    return get(this._store);
  }

  set(value) {
    this._store.set(value);
    setStorage(this.name, value);
  }

  update(callback) {
    this._store.update(callback);
    setStorage(this.name, get(this._store));
  }

  reset() {
    this._store.set(this.defaultValue);
    setStorage(this.name, this.defaultValue);
  }

  subscribe(callback) {
    return this._store.subscribe(callback);
  }
}

export async function getStorage(key) {
  const result = await storage.get(key);
  return result ? result[key] : result;
}

export async function setStorage(key, value) {
  let obj = {}
  obj[key] = value;
  return await storage.set(obj);
}

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