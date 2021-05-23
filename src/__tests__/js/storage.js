/* eslint-disable no-undef */
import {
  LookupStore,
  SyncStore,
  exportStores,
  importStores
} from '../../js/storage.js';

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

  it('can set and persist the entire lookup at once', async () => {
    const storage = new MockBackend();
    const ss = new LookupStore('test', 'default', new MockBackend());
    ss.set('first key', 'val1');
    const entire = ss.getEntire();
    const ns = new LookupStore('test', 'default', storage);
    await ns.setEntire(entire);
    const ls = new LookupStore('test', 'default', storage);
    await ls.loaded;
    expect(ls.get('first key')).toEqual('val1');
  });
});

describe('import and export system', () => {
  it('works with SyncStores', () => {
    const storage = new MockBackend();
    const ss1 = new SyncStore('firstStore', 10, storage);
    const ss2 = new SyncStore('secondStore', 20, storage);
    const ss3 = new SyncStore('thirdStore', 30, storage);
    const getVals = () => [ss1, ss2, ss3].map(s => s.get());
    const exported = exportStores();
    const expected = [10, 20, 30];
    importStores(exported);
    expect(getVals()).toEqual(expected);
    ss1.set(40);
    ss3.set(10);
    importStores(exported);
    expect(getVals()).toEqual(expected);
  });

  it('works with LookupStores', () => {
    const storage = new MockBackend();
    const ls1 = new LookupStore('first', 10, storage);
    const ls2 = new LookupStore('second', 20, storage);
    const exported = exportStores();
    importStores(exported);
    expect(ls1.get('key')).toEqual(10);
    ls1.set('key', 30);
    ls2.set('key', 10);
    importStores(exported);
    expect(ls1.get('key')).toEqual(10);
    expect(ls2.get('key')).toEqual(20);
  });

  it('works with both SyncStores and LookupStores', () => {
    const storage = new MockBackend();
    const ss = new SyncStore('first', 10, storage);
    const ls = new LookupStore('second', 20, storage);
    const exported = exportStores();
    ss.set(30);
    ls.set('key', 30);
    importStores(exported);
    expect(ss.get()).toEqual(10);
    expect(ls.get('key')).toEqual(20);
  });
});
