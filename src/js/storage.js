import { get, writable } from 'svelte/store';
import { Browser, BROWSER } from './web-constants.js';
import { storageVersion } from './constants.js';

export const storage = new Storage(storageVersion);

export class SyncStore {
  constructor(name, defaultValue, storageBackend=null) {
    this.name = name;
    this.defaultValue = defaultValue;
    const store = writable(defaultValue);
    this._store = store;
    this._storage = storageBackend || storage;
    this._storage.get(name).then(value => {
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
    this._storage.set(this.name, value);
  }

  update(callback) {
    this._store.update(callback);
    this._storage.set(this.name, get(this._store));
  }

  reset() {
    this._store.set(this.defaultValue);
    this._storage.set(this.name, this.defaultValue);
  }

  subscribe(callback) {
    return this._store.subscribe(callback);
  }
}

async function getStorage(key, version='') {
  const versionKey = `${version || this.version}$$${key}`;
  const result = await this.rawGet(versionKey);
  return result ? result[versionKey] : result;
}

async function setStorage(key, value, version='') {
  const versionKey = `${version || this.version}$$${key}`;
  let obj = {};
  obj[versionKey] = value;
  return await this.rawSet(obj);
}

Storage.prototype.get = getStorage;
Storage.prototype.set = setStorage;

export function Storage(version) {
  this.version = version;

  switch (BROWSER) {
  case Browser.ANDROID:
    this.rawGet = async key => {
      let data = {};
      try {
        data[key] = JSON.parse(localStorage[key]);
      } catch (e) {
        data[key] = localStorage[key];
      }
      return data;
    };

    this.rawSet = async obj => {
      let key = Object.keys(obj)[0];
      localStorage[key] = JSON.stringify(obj[key]);
    };
    break;
  case Browser.FIREFOX:
    this.rawGet = async (key) => {
    // eslint-disable-next-line no-undef
      return await browser.storage.local.get(key);
    };

    this.rawSet = async (obj) => {
    // eslint-disable-next-line no-undef
      return await browser.storage.local.set(obj);
    };
    break;
  default:
    this.rawGet = (key) => {
      return new Promise((res) => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.get(key, res);
      });
    };

    this.rawSet = (obj) => {
      return new Promise((res) => {
      // eslint-disable-next-line no-undef
        chrome.storage.local.set(obj, res);
      });
    };
  }
}