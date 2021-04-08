import { get, writable } from 'svelte/store';
import { storageVersion, Browser, BROWSER } from './constants.js';

export const storage = new Storage(storageVersion);

/** @type {Map<String, SyncStore>} */
const stores = new Map();

/**
 * Store that synchronizes with extension storage.
 * 
 * @template T
 */
export class SyncStore {
  /**
   * @param {String} name 
   * @param {T} defaultValue 
   * @param {Storage} storageBackend 
   */
  constructor(name, defaultValue, storageBackend=null) {
    this.name = name;
    this.defaultValue = defaultValue;
    const store = writable(defaultValue);
    this._store = store;
    this._storage = storageBackend || storage;
    this.loadFromStorage();
    stores.set(mangleStorageKey(name, storageVersion), this);
  }

  async loadFromStorage() {
    this._storage.get(this.name).then(value => {
      if (value != null) {
        this._store.set(value);
      }
    });
  }

  /**
   * @returns {T} the store value
   */
  get() {
    return get(this._store);
  }

  /**
   * @param {T} value 
   */
  set(value) {
    this._store.set(value);
    this._storage.set(this.name, value);
  }

  /**
   * @param {(n: T) => T} callback 
   */
  update(callback) {
    this._store.update(callback);
    this._storage.set(this.name, get(this._store));
  }

  reset() {
    this._store.set(this.defaultValue);
    this._storage.set(this.name, this.defaultValue);
  }

  /**
   * @param {(n: T) => void} callback 
   * @returns {() => void}
   */
  subscribe(callback) {
    return this._store.subscribe(callback);
  }
}

/**
 * @template T
 * @typedef {(key: String, value: T) => void} Subscriber
 */

/**
 * Lookup store that synchronizes with extension storage.
 * 
 * @template T
 */
export class LookupStore {
  /**
   * @param {String} name 
   * @param {T} defaultValue 
   * @param {Storage} storageBackend 
   */
  constructor(name, defaultValue, storageBackend=null) {
    this.name = name;
    this.defaultValue = defaultValue;
    this._storage = storageBackend || storage;
    this._lookup = {};
    /** @type {String[]} */
    this.keys = [];
    /** @type {Map<Number, Subscriber<T>>} */
    this._subscribers = new Map();
    this._subnum = 0;
    this._keyname = `${this.name}[]`;
    this.loaded = this.loadFromStorage();
  }

  /** @private */
  async loadFromStorage() {
    this.keys = (await this._storage.get(this._keyname) || this.keys)
      .filter(k => k);
    await Promise.all(this.keys.map(async k => {
      this._lookup[k] = await this._storage.get(this.mangleKey(k));
    }));
  }

  /**
   * @private
   * @param {String} key 
   */
  mangleKey(key) {
    return `${this.name}:$$${key}`;
  }

  /**
   * @private
   * @param {[key: String, value: T]} change
   */
  notify(change) {
    this._subscribers.forEach(subscriber => subscriber(...change));
  }

  /**
   * @param {String} key
   * @return {T}
   */
  get(key) {
    return this._lookup[key] || this.defaultValue;
  }

  /**
   * @param {String} key
   * @param {T} value
   */
  async set(key, value) {
    const previous = this._lookup[key];
    this._lookup[key] = value;
    const save = [this._storage.set(this.mangleKey(key), value)];
    if (previous == null) {
      this.keys.push(key);
      save.push(this._storage.set(this._keyname, this.keys));
    }
    await Promise.all(save);
    this.notify([key, value]);
  }

  /**
   * @param {(v: T) => T} callback
   */
  async update(name, callback) {
    this.set(name, await callback(this.get(name)));
  }

  /**
   * @param {Subscriber<T>} callback
   * @returns {() => void}
   */
  subscribe(callback) {
    const id = this._subnum++;
    this._subscribers.set(id, callback);
    return () => {
      this._subscribers.delete(id);
    };
  }

}

function mangleStorageKey(key, version='') {
  return `${version || storage.version}$$${key}`;
}

async function getStorage(key, version='') {
  const versionKey = mangleStorageKey(key, version);
  const result = await this.rawGet(versionKey);
  return result ? result[versionKey] : result;
}

async function setStorage(key, value, version='') {
  const versionKey = mangleStorageKey(key, version);
  let obj = {};
  obj[versionKey] = value;
  return await this.rawSet(obj);
}

Storage.prototype.get = getStorage;
Storage.prototype.set = setStorage;

/**
 * @constructor
 * @param {String} version 
 */
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
    // @ts-ignore
    // eslint-disable-next-line no-undef
    browser.storage.onChanged.addListener(updateChangedStores);
    this.rawGet = async (key) => {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      return await browser.storage.local.get(key);
    };

    this.rawSet = async (obj) => {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      return await browser.storage.local.set(obj);
    };
    break;
  default:
    // @ts-ignore
    // eslint-disable-next-line no-undef
    chrome.storage.onChanged.addListener(updateChangedStores);
    this.rawGet = (key) => {
      return new Promise((res) => {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        chrome.storage.local.get(key, res);
      });
    };

    this.rawSet = (obj) => {
      return new Promise((res) => {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        chrome.storage.local.set(obj, res);
      });
    };
  }
}

function updateChangedStores(changes) {
  const changedItems = Object.keys(changes);

  for (const item of changedItems) {
    if (!stores.has(item)) continue;
    stores.get(item).loadFromStorage();
  }
}