import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const bundlePath = process.env.BUNDLE_PATH || `${process.cwd()}/build/submodules/chat/src/scripts/chat-translation-host.js`;

const resolveBrowserBinary = () => {
  const candidates = [
    process.env.CHROME_BIN,
    '/snap/bin/chromium',
    'google-chrome',
    'google-chrome-stable',
    'chromium-browser',
    'chromium'
  ].filter(Boolean);

  for (const candidate of candidates) {
    const result = spawnSync('bash', ['-lc', `command -v "${candidate}"`], {
      encoding: 'utf8'
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  }

  throw new Error('No Chrome/Chromium binary found. Set CHROME_BIN.');
};

const main = async () => {
  const browserBinary = resolveBrowserBinary();
  const browser = await chromium.launch({
    executablePath: browserBinary,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // `iframe-translator` default host. We intercept it so this test doesn't depend on network.
    const hostPrefix = 'https://kentonishi.com/iframe-translator';
    await page.route(`${hostPrefix}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: `<!doctype html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <script>
      // Signal readiness to the parent (what iframe-translator waits for).
      window.parent.postMessage(JSON.stringify({ type: 'loaded' }), '*');

      window.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || data.type !== 'request') return;
          window.parent.postMessage(JSON.stringify({
            type: 'response',
            messageID: data.messageID,
            text: 'translated:' + data.text
          }), '*');
        } catch {}
      });
    </script>
  </body>
</html>`
      });
    });

    await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    await page.addScriptTag({ path: bundlePath });

    const result = await page.evaluate(async () => {
      const REQUEST_TYPE = 'hc-ltl-translate-request';
      const RESPONSE_TYPE = 'hc-ltl-translate-response';

      const messageId = `smoke-${Date.now()}`;
      const original = 'hello from smoke';

      const response = await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('timeout waiting for response')), 15_000);

        const onMessage = (event) => {
          if (event?.data?.type !== RESPONSE_TYPE) return;
          if (event?.data?.messageId !== messageId) return;
          window.clearTimeout(timeout);
          window.removeEventListener('message', onMessage);
          resolve(event.data.text);
        };

        window.addEventListener('message', onMessage);
        window.postMessage({
          type: REQUEST_TYPE,
          messageId,
          text: original,
          targetLanguage: 'en'
        }, '*');
      });

      return {
        original,
        response
      };
    });

    console.log(JSON.stringify(result, null, 2));

    const ok = typeof result.response === 'string' && result.response.startsWith('translated:');
    if (!ok) {
      throw new Error(`Unexpected response: ${JSON.stringify(result.response)}`);
    }
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
