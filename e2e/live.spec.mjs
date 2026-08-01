import { expect, test } from './fixtures.mjs';

const liveVideo = 'https://www.youtube.com/watch?v=X4VbdwhkE10';
const tldexVod = 'https://www.youtube.com/watch?v=4I2iZahIDNg';
const youtubeChatVod = 'https://www.youtube.com/watch?v=c747jYku6Eo';

test.describe('@live real YouTube', () => {
  test.describe.configure({ timeout: 180_000 });

  const openChat = async (page, url) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const chatframe = page.locator('iframe#chatframe');
    try {
      await expect(chatframe).toBeVisible({ timeout: 120_000 });
    } catch (error) {
      const text = await page.locator('body').innerText().catch(() => 'unreadable page');
      throw new Error(`YouTube did not expose chat (CAPTCHA, ads, region, or upstream page change): ${text.slice(0, 300)}`, { cause: error });
    }
    return page.frameLocator('iframe#chatframe');
  };

  const openEmbed = async (page, url, waitForTldex = false) => {
    const ready = { registrations: 0, tldex: false };
    page.on('console', message => {
      const text = message.text();
      if (text.startsWith('Register client successful')) ready.registrations++;
      if (text.startsWith('got scripts')) ready.tldex = true;
    });

    const chat = await openChat(page, url);
    await chat.getByRole('button', { name: 'Embed TLs' }).click();
    const embed = chat.frameLocator('iframe');
    await expect(embed.getByRole('heading', { name: 'Welcome to LiveTL!' })).toBeVisible();
    await expect.poll(() => ready.registrations).toBeGreaterThanOrEqual(2);
    if (waitForTldex) await expect.poll(() => ready.tldex).toBe(true);

    const video = page.locator('video').first();
    await expect(video).toBeAttached();
    const initialTime = await video.evaluate(element => element.currentTime);
    await video.evaluate(element => element.play());
    await expect.poll(() => video.evaluate(element => element.currentTime))
      .toBeGreaterThan(initialTime + 0.5);
    return embed;
  };

  const seek = async (page, seconds) => {
    const player = page.locator('#movie_player');
    await expect.poll(() => player.evaluate(element => typeof element.seekTo))
      .toBe('function');
    await player.evaluate((element, time) => {
      element.seekTo(time, true);
      element.playVideo();
    }, seconds);
    await expect.poll(() => page.locator('video').first().evaluate(element => element.currentTime))
      .toBeGreaterThan(seconds - 1);
  };

  test('keeps a current continuation and mounts HyperChat', async ({ page }) => {
    const chat = await openChat(page, liveVideo);
    await expect(chat.locator('#hc-buttons')).toBeVisible();
    await expect(chat.locator('iframe#hyperchat')).toBeVisible();
    await expect(chat.frameLocator('iframe#hyperchat').locator('.hyperchat-root')).toBeVisible();
    await expect.poll(() => page.frames().map(frame => frame.url()))
      .toContainEqual(expect.stringMatching(/\/live_chat.*continuation=/));
  });

  test('shows the exact TLDex VOD translation', async ({ page }) => {
    const embed = await openEmbed(page, tldexVod, true);
    await seek(page, 17 * 60 + 50);
    const message = embed.locator('.message-display > .message').filter({ hasText: 'Mio: Ah....' }).first();
    await expect(message.locator('.message-content')).toContainText('Mio: Ah....');
    await expect(message.locator('.message-info')).toContainText('Taishi');
    await expect(message.locator('.message-info')).toContainText('TLdex');
    await expect(message.locator('.message-info')).toContainText('(02:05)');
  });

  test('shows the exact YouTube-chat VOD translation', async ({ page }) => {
    const embed = await openEmbed(page, youtubeChatVod);
    await seek(page, 24 * 60 + 7);
    const message = embed.locator('.message-display > .message').filter({ hasText: 'just being beside peko makes me happy' }).first();
    await expect(message.locator('.message-content')).toContainText('just being beside peko makes me happy');
    await expect(message.locator('.message-info')).toContainText('Yami Chan');
    await expect(message.locator('.message-info')).toContainText('(24:09)');
    await expect(message.locator('.message-info')).not.toContainText('TLdex');
  });

  test('keeps translation scrolling behavior', async ({ page }) => {
    const embed = await openEmbed(page, tldexVod, true);
    const messages = embed.locator('.message-display > .message');
    await expect(embed.locator('.recent-button')).toHaveCount(0);

    let previous = 0;
    for (const seconds of [10 * 60 + 50, 20 * 60 + 50, 30 * 60 + 50, 40 * 60 + 50]) {
      await seek(page, seconds);
      await expect.poll(() => messages.count()).toBeGreaterThan(previous);
      previous = await messages.count();
    }
    expect(previous).toBeGreaterThanOrEqual(4);

    await messages.first().evaluate(element => element.scrollIntoView());
    const recent = embed.locator('.recent-button button');
    await expect(recent).toBeVisible();
    await recent.click();
    await expect(recent).toBeHidden();
  });
});
