import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, expect, test as base } from '@playwright/test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensionPath = path.join(repoRoot, 'build/chrome');
const manifest = JSON.parse(readFileSync(path.join(extensionPath, 'manifest.json'), 'utf8'));
const { version } = manifest;

export const test = base.extend({
  context: async ({ headless }, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless,
      viewport: { width: 1280, height: 900 },
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });

    await use(context);
    await context.close();
  },
  extensionId: [
    async ({ context }, use) => {
      let [worker] = context.serviceWorkers();
      worker ??= await context.waitForEvent('serviceworker');

      await worker.evaluate(async (version) => {
        await chrome.storage.local.set({
          'hc.enabled': true,
          'hc.autoLiveChat': false,
          'v0-alpha$$lastVersion': version,
        });
      }, version);

      await use(new URL(worker.url()).host);
    },
    { auto: true },
  ],
});

export { expect };
