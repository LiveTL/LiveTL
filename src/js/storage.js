import { writable } from 'svelte/store';
import { Browser, BROWSER } from './web-constants.js';

export const storage = new Storage();

export class SettingStore {
  constructor(name, defaultValue) {
    this.name = name;
    this.defaultValue = defaultValue;
    const store = writable(defaultValue);
    this._store = store;
    storage.get(name).then(value => {
      if (value != null) {
        store.set(name, value);
      }
    });
  }

  get() {
    return this._store.get();
  }

  set(value) {
    this._store.set(value);
    storage.set(this.name, value);
  }

  update(callback) {
    this._store.update(callback);
    storage.set(this.name, this._store.get());
  }

  reset() {
    this._store.set(this.defaultValue);
    storage.set(this.name, this.defaultValue);
  }

  subscribe(callback) {
    return this._store.subscribe(callback);
  }
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