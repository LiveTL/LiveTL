import { mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright-core';

const testVideoId = 'X4VbdwhkE10';
const defaultUrl = `https://www.youtube.com/watch?v=${testVideoId}`;
const extensionPath = process.env.EXT_PATH || `${process.cwd()}/build`;
const userDataDirOverride = process.env.USER_DATA_DIR;
const testUrl = process.env.TEST_URL || defaultUrl;
const keepOpen = process.env.KEEP_OPEN === '1';

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

const waitForExtensionTarget = async (context) => {
  const existingWorker = context.serviceWorkers()[0];
  if (existingWorker != null) {
    return existingWorker;
  }

  try {
    return await context.waitForEvent('serviceworker', { timeout: 15_000 });
  } catch {}

  const existingPage = context.pages().find((page) => page.url().startsWith('chrome-extension://'));
  if (existingPage != null) {
    return existingPage;
  }

  return await context.waitForEvent('page', {
    timeout: 15_000,
    predicate: (page) => page.url().startsWith('chrome-extension://')
  });
};

const waitForHyperchat = async (chatFrame) => {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const state = await chatFrame.evaluate(() => {
      const hcButtons = document.querySelector('#hc-buttons');
      const hyperchat = document.querySelector('iframe#hyperchat');
      return {
        hasHcButtons: hcButtons !== null,
        hasHyperchat: hyperchat !== null,
        bodyText: document.body?.innerText.slice(0, 200) ?? null
      };
    });

    if (state.hasHcButtons && state.hasHyperchat) {
      return state;
    }

    await chatFrame.waitForTimeout(1_000);
  }

  return await chatFrame.evaluate(() => {
    const hcButtons = document.querySelector('#hc-buttons');
    const hyperchat = document.querySelector('iframe#hyperchat');
    return {
      hasHcButtons: hcButtons !== null,
      hasHyperchat: hyperchat !== null,
      bodyText: document.body?.innerText.slice(0, 200) ?? null
    };
  });
};

const main = async () => {
  const userDataDir = userDataDirOverride || await mkdtemp(`${tmpdir()}/livetl-codex-profile.`);
  if (userDataDirOverride != null) {
    await rm(userDataDir, { recursive: true, force: true });
  }

  const browserBinary = resolveBrowserBinary();
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: browserBinary,
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-features=IsolateOrigins,site-per-process,TranslateUI',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--allow-insecure-localhost',
      '--disable-notifications',
      '--disable-translate',
      '--disable-infobars',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  try {
    const extensionTarget = await waitForExtensionTarget(context);
    const storage = await extensionTarget.evaluate(async () => {
      await chrome.storage.local.set({
        'hc.enabled': true,
        'hc.autoLiveChat': true
      });
      return await chrome.storage.local.get(null);
    });

    const page = await context.newPage();
    await page.goto(testUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000
    });
    await page.waitForTimeout(15_000);

    const pageInfo = await page.evaluate(() => ({
      href: location.href,
      title: document.title,
      ready: document.readyState
    }));

    const chatFrameHandle = await page.waitForSelector('iframe#chatframe', {
      timeout: 120_000
    });
    const chatFrame = await chatFrameHandle.contentFrame();
    if (chatFrame == null) {
      throw new Error('Failed to resolve chat frame.');
    }

    await chatFrame.waitForLoadState('domcontentloaded', {
      timeout: 120_000
    }).catch(() => {});
    await chatFrame.waitForTimeout(10_000);

    const settledChatState = await waitForHyperchat(chatFrame);
    const chatSummary = await chatFrame.evaluate(() => {
      const hcButtons = document.querySelector('#hc-buttons');
      const hyperchat = document.querySelector('iframe#hyperchat');
      return {
        url: location.href,
        title: document.title,
        hasHcButtons: hcButtons !== null,
        hcButtonText: hcButtons?.textContent ?? null,
        hasToggleButton: document.querySelector('.toggleButton') !== null,
        hasPrimaryContent: document.querySelector('#primary-content') !== null,
        hasItemList: document.querySelector('#chat>#item-list') !== null,
        hasTicker: document.querySelector('#ticker') !== null,
        hasHyperchat: hyperchat !== null,
        bodyText: document.body?.innerText.slice(0, 200) ?? null
      };
    });

    const hyperchatHandle = await chatFrame.$('iframe#hyperchat');
    const hyperchatFrame = hyperchatHandle == null ? null : await hyperchatHandle.contentFrame();

    let embedSummary = null;
    if (hyperchatFrame != null) {
      await hyperchatFrame.waitForLoadState('domcontentloaded', {
        timeout: 120_000
      }).catch(() => {});
      await hyperchatFrame.waitForTimeout(5_000);
      embedSummary = await hyperchatFrame.evaluate(() => {
        const playerArtifacts = ['#player', '#player-controls', '.player-unavailable', 'yt-live-chat-app', 'ytd-app', 'ytm-app']
          .filter((selector) => document.querySelector(selector) != null);
        const playerLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .filter((link) => {
            const href = link.getAttribute('href') ?? '';
            return link.getAttribute('name') === 'www-player' || href.includes('www-player.css');
          })
          .map((link) => ({
            name: link.getAttribute('name'),
            href: link.getAttribute('href')
          }));
        const icon = document.querySelector('.material-icons');
        return {
          url: location.href,
          hasRoot: document.querySelector('.hyperchat-root') !== null,
          playerArtifacts,
          playerLinks,
          bodyFontSize: getComputedStyle(document.body).fontSize,
          iconFontSize: icon == null ? null : getComputedStyle(icon).fontSize,
          text: document.body?.innerText.slice(0, 200) ?? null
        };
      });
    }

    const summary = {
      storage,
      page: pageInfo,
      chat: {
        ...chatSummary,
        hasContinuation: chatSummary.url.includes('continuation='),
        isLiveChat: chatSummary.url.includes('/live_chat'),
        settled: settledChatState
      },
      embed: embedSummary
    };

    console.log(JSON.stringify(summary, null, 2));

    const failed = (
      !pageInfo.href.includes(testVideoId) ||
      !chatSummary.url.includes('continuation=') ||
      !chatSummary.url.includes('/live_chat') ||
      !chatSummary.hasHcButtons ||
      !chatSummary.hasHyperchat ||
      embedSummary == null ||
      !embedSummary.hasRoot ||
      embedSummary.playerLinks.length !== 0 ||
      embedSummary.playerArtifacts.length !== 0
    );

    if (failed) {
      process.exitCode = 1;
    }

    if (keepOpen) {
      await new Promise(() => {});
    }
  } finally {
    if (!keepOpen) {
      await context.close();
      if (userDataDirOverride == null) {
        await rm(userDataDir, { recursive: true, force: true });
      }
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
