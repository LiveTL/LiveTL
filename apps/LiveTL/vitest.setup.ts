import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const storageValues: Record<string, unknown> = {};
const storageArea = {
  get: vi.fn((keys: string | string[] | Record<string, unknown> | null, callback: (values: Record<string, unknown>) => void) => {
    if (typeof keys === 'string') {
      callback({ [keys]: storageValues[keys] });
    } else if (Array.isArray(keys)) {
      callback(Object.fromEntries(keys.map((key) => [key, storageValues[key]])));
    } else if (keys && typeof keys === 'object') {
      callback(Object.fromEntries(Object.entries(keys).map(([key, fallback]) => [key, storageValues[key] ?? fallback])));
    } else {
      callback({ ...storageValues });
    }
  }),
  set: vi.fn((values: Record<string, unknown>, callback?: () => void) => {
    Object.assign(storageValues, values);
    callback?.();
  }),
  remove: vi.fn((keys: string | string[], callback?: () => void) => {
    for (const key of Array.isArray(keys) ? keys : [keys]) delete storageValues[key];
    callback?.();
  }),
  clear: vi.fn((callback?: () => void) => {
    for (const key of Object.keys(storageValues)) delete storageValues[key];
    callback?.();
  }),
};

Object.assign(globalThis, {
  chrome: {
    storage: {
      local: storageArea,
      sync: storageArea,
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  },
});
