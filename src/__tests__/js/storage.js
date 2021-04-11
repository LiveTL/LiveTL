/* eslint-disable no-undef */
import { LookupStore, SyncStore } from '../../js/storage.js';

function MockBackend() {
  const storage = {};
  this.get = async key => storage[key];
  this.set = async (key, value) => storage[key] = value;
  this.storage = storage;
}

describe('Synchronized store', () => {
  it('sets a default value', async () => {
    const storage = new MockBackend();
    const ss = await new SyncStore('test', 'default value', storage);
    expect(ss.get()).toEqual('default value');
  });

  it('loads from the extension storage', async () => {
    const storage = new MockBackend();
    storage.set('test', 'saved value');
    const ss = await new SyncStore('test', 'default value', storage);
    expect(ss.get()).toEqual('saved value');
  });

  it('saves to the extension storage', async () => {
    const storage = new MockBackend();
    const ss = new SyncStore('test', 'default value', storage);
    await ss.set('new value');
    expect(await storage.get('test')).toEqual('new value');
  });

  it('resets to the default value', async () => {
    const storage = new MockBackend();
    storage.set('test', 'saved value');
    const ss = await new SyncStore('test', 'default value', storage);
    await ss.reset();
    expect(await ss.get()).toEqual('default value');
    expect(await storage.get('test')).toEqual('default value');
  });
});

describe('Synchronized lookup store', () => {
  it('sets a default value', async () => {
    const storage = new MockBackend();
    const ss = await new LookupStore('test', { value: 'default' }, storage);
    expect(ss.get('nonexistant')).toEqual({ value: 'default' });
  });

  it('synchronizes with the extension storage', async () => {
    const storage = new MockBackend();
    const newStore = () => new LookupStore('test', { value: 'default' }, storage);
    const ss = await newStore();
    await ss.set('test key', { value: 'not default' });
    expect(ss.get('test key')).toEqual({ value: 'not default' });
    const other = newStore();
    await other.loaded;
    expect(other.get('test key')).toEqual({ value: 'not default' });
  });

  it('notifies subscribers of changes', async () => {
    const storage = new MockBackend();
    const ss = new LookupStore('test', { value: 'default' }, storage);
    /** @type {{ value: String }[]} */
    const notifs = [];
    const expectedNotifs = [
      { k: 'first key', v: { value: 'first not default' } },
      { k: 'second key', v: { value: 'second not default' } }
    ];
    ss.subscribe((k, v) => notifs.push({ k, v }));
    await ss.set('first key', { value: 'first not default' });
    await ss.set('second key', { value: 'second not default' });
    expect(notifs).toEqual(expectedNotifs);
  });

  it('can unsubscribe subscribers', async () => {
    const storage = new MockBackend();
    const ss = new LookupStore('test', { value: 'default' }, storage);
    const notifs = [];
    ss.subscribe(notifs.push)();
    await ss.set('first key', { value: 'first not default' });
    await ss.set('second key', { value: 'second not default' });
    expect(notifs.length).toEqual(0);
  });
});