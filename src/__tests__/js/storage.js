/* eslint-disable no-undef */
import { SyncStore } from '../../js/storage.js';

function MockBackend() {
  const storage = {};
  this.get = async key => storage[key];
  this.set = async (key, value) => storage[key] = value;
  this.storage = storage;
}

describe('Synchronized stores', () => {
  it('sets a default value', () => {
    const storage = new MockBackend();
    const ss = new SyncStore('test', 'default value', storage);
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