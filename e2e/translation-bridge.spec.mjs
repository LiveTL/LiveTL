import { expect, test } from '@playwright/test';
import path from 'node:path';

const bundlePath = path.resolve('build/mv2/submodules/chat/src/scripts/chat-translation-host.js');
const translatorHost = 'https://kentonishi.com/iframe-translator';

test('translates through the packaged Firefox MV2 bridge', async ({ page }) => {
  await page.route('**/*', async route => {
    if (!route.request().url().startsWith(translatorHost)) {
      await route.abort('blockedbyclient');
      return;
    }

    await route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><script>
        parent.postMessage(JSON.stringify({ type: 'loaded' }), '*');
        addEventListener('message', event => {
          const request = JSON.parse(event.data);
          if (request.type !== 'request') return;
          parent.postMessage(JSON.stringify({
            type: 'response',
            messageID: request.messageID,
            text: 'translated:' + request.text
          }), '*');
        });
      </script>`
    });
  });

  await page.setContent('<!doctype html><body></body>');
  await page.addScriptTag({ path: bundlePath });
  await page.evaluate(() => {
    window.bridgeResponse = null;
    const messageId = 'playwright-bridge';
    addEventListener('message', event => {
      if (event.data?.type === 'hc-ltl-translate-response' && event.data.messageId === messageId) {
        window.bridgeResponse = event.data.text;
      }
    });
    postMessage({
      type: 'hc-ltl-translate-request',
      messageId,
      text: 'hello from Firefox',
      targetLanguage: 'en'
    }, '*');
  });

  await expect.poll(() => page.evaluate(() => window.bridgeResponse)).toBe('translated:hello from Firefox');
});
