import { expect, test } from './fixtures.mjs';

const watchUrl = 'https://www.youtube.com/watch?v=fixture-video';

const watchPage = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>LiveTL fixture</title></head>
  <body style="margin: 0">
    <iframe id="chatframe" src="https://www.youtube.com/live_chat?v=fixture-video" style="width: 640px; height: 700px"></iframe>
  </body>
</html>`;

const chatPage = `<!doctype html>
<html dark>
  <head>
    <meta charset="utf-8">
    <script>window.ytcfg = { data_: { INNERTUBE_API_KEY: 'fixture', INNERTUBE_CONTEXT: { client: {} } } };</script>
  </head>
  <body>
    <script>window["ytInitialData"] = {"continuationContents":{"liveChatContinuation":{"actions":[],"continuations":[]}}};</script>
    <yt-live-chat-app>
      <yt-live-chat-renderer>
        <div id="primary-content"></div>
        <div id="chat"><div id="item-list"></div></div>
        <div id="ticker"></div>
        <tp-yt-paper-listbox id="menu"><div>Top chat</div><div>Live chat</div></tp-yt-paper-listbox>
      </yt-live-chat-renderer>
    </yt-live-chat-app>
  </body>
</html>`;

const embedPage = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" name="www-player" href="data:text/css,/*www-player.css*/">
    <link rel="stylesheet" name="embed-ui" href="data:text/css,/*ytembeds*/">
  </head>
  <body>
    <div id="player"></div>
    <div id="player-controls"></div>
    <div class="player-unavailable"></div>
    <yt-live-chat-app></yt-live-chat-app>
    <ytd-app></ytd-app>
    <ytm-app></ytm-app>
  </body>
</html>`;

const mockYoutube = async (context) => {
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());

    if (url.protocol === 'chrome-extension:') {
      await route.continue();
    } else if (url.origin === 'https://www.youtube.com' && url.pathname === '/watch') {
      await route.fulfill({ contentType: 'text/html', body: watchPage });
    } else if (url.origin === 'https://www.youtube.com' && url.pathname.startsWith('/live_chat')) {
      await route.fulfill({ contentType: 'text/html', body: chatPage });
    } else if (url.origin === 'https://www.youtube.com' && url.pathname === '/embed/hyperchat_embed') {
      await route.fulfill({ contentType: 'text/html', body: embedPage });
    } else {
      await route.abort('blockedbyclient');
    }
  });
};

const openEmbed = async (page) => {
  const chat = page.frameLocator('#chatframe');
  await chat.getByRole('button', { name: 'Embed TLs' }).click();
  const embed = chat.frameLocator('iframe');
  await expect(embed.getByRole('heading', { name: 'Welcome to LiveTL!' })).toBeVisible();
  return embed;
};

const heightOf = async locator => (await locator.boundingBox()).height;

test.beforeEach(async ({ context }) => {
  await mockYoutube(context);
});

test('injects LiveTL and mounts a clean HyperChat embed', async ({ page }) => {
  await page.goto(watchUrl);
  const chat = page.frameLocator('#chatframe');

  await expect(chat.locator('#ltl-wrapper > button')).toHaveText([
    'Open LiveTL',
    'TL Popout',
    'Embed TLs',
    ''
  ]);
  await expect(chat.locator('#hc-buttons')).toBeVisible();
  await expect(chat.locator('#hc-buttons [data-tooltip]')).toHaveAttribute('data-tooltip', 'Disable HyperChat');
  await expect(chat.locator('iframe#hyperchat')).toBeVisible();

  const hyperchat = chat.frameLocator('iframe#hyperchat');
  await expect(hyperchat.locator('.hyperchat-root')).toBeVisible();
  await expect(hyperchat.locator('link[name="www-player"], link[href*="www-player.css"], link[name="embed-ui"], link[href*="ytembeds"]')).toHaveCount(0);
  await expect(hyperchat.locator('#player, #player-controls, .player-unavailable, yt-live-chat-app, ytd-app, ytm-app')).toHaveCount(0);

  await openEmbed(page);
});

test('persists the embedded translation pane height', async ({ page }) => {
  await page.goto(watchUrl);
  let embed = await openEmbed(page);
  let pane = embed.locator('.message-display-wrapper');
  const handle = embed.locator('.ui-resizable-s');

  await expect(handle).toBeVisible();
  const before = await heightOf(pane);
  const box = await handle.boundingBox();
  await handle.hover();
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 40, { steps: 5 });
  await page.mouse.up();

  await expect.poll(() => heightOf(pane)).toBeLessThan(before - 30);
  const resized = await heightOf(pane);

  await page.goto(watchUrl);
  embed = await openEmbed(page);
  pane = embed.locator('.message-display-wrapper');
  await expect.poll(async () => Math.abs(await heightOf(pane) - resized)).toBeLessThan(3);
});
