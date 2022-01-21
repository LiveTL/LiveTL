const puppeteer = require('puppeteer');
const pathlib = require('path');
const path = pathlib.join(__dirname, '..', 'build');
const manifest = require(pathlib.join(__dirname, '..', 'src', 'manifest.json'));
const xvfb = new (require('xvfb'))({
  silent: true,
  xvfb_args: ['-screen', '0', '1280x800x24', '-ac']
});
xvfb.start((err) => { if (err) console.error(err); });

async function exportImage(name, page, url, func, scale, additionalMethod = () => {}) {
  await page.emulateMediaFeatures([{
    name: 'prefers-color-scheme', value: 'dark'
  }]);
  await page.goto(url);
  await page.setViewport({ width: 1280, height: 800 });
  console.log(`Exporting '${name}'...`);
  const p = `calc(100% * ${scale[1]} / ${scale[0]})`;
  await page.addStyleTag({
    content: `
    html {
      width: ${p};
      height: ${p};
      transform-origin: 0px 0px;
      transform: scale(calc(${scale[0]} / ${scale[1]}));
    }
  `
  });
  await page.evaluate(() => (window.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))));
  await page.evaluate(func);
  await additionalMethod(page);
  return page.screenshot({ path: `img/${name}.png` });
}

(async () => {
  try {
    // download the browser
    console.log('Downloading browser...');
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('856583');

    // open the browser
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
      executablePath: revisionInfo.executablePath,
      headless: false,
      args: [
        `--disable-extensions-except=${path}`,
        `--load-extension=${path}`,
        '--window-size=1280,800',
        // '--start-fullscreen',
        `--display=${xvfb._display}`
      ],
      ignoreDefaultArgs: ['--hide-scrollbars']
    });

    // Name of the extension
    const extensionName = manifest.name;

    // Find the extension
    const targets = await browser.targets();
    const extensionTarget = targets.find(({ _targetInfo }) => {
      return _targetInfo.title === extensionName && _targetInfo.type === 'background_page';
    });

    // Extract the URL
    const extensionURL = extensionTarget._targetInfo.url;
    console.log(`Extracted URL:  ${extensionURL}`);
    const urlSplit = extensionURL.split('/');
    const extensionID = urlSplit[2];
    console.log(`Extension ID: ${extensionID}`);

    // Define the extension page
    const watchPageURL = [
      'watch.html?',
      'continuation=op2w0wRiGlhDaWtxSndvWVZVTkljM2cwU0hGaExURlBVbXBSVkdnNVZGbEVhSGQzRWd0ak56UT',
      'NhbGxyZFRaRmJ4b1Q2cWpkdVFFTkNndGpOelEzYWxscmRUWkZieUFCQAFyAggEeAE%253D&',
      'video=c747jYku6Eo&isReplay=true'
    ].join('');

    // Navigate to the page
    console.log('Simulating user interactions...');
    const page = await browser.newPage();
    // page
    //   .on('console', message =>
    //     console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    //   .on('pageerror', ({ message }) => console.log(message));
    // .on('response', response =>
    //   console.log(`${response.status()} ${response.url()}`))
    // .on('requestfailed', request =>
    //   console.log(`${request.failure().errorText} ${request.url()}`));

    const pages = {
      options: [`chrome-extension://${extensionID}/options.html`, async () => {
        await window.sleep(1000);
        document.querySelectorAll('li')[0].click();
      }, [3, 2]],
      filters: [`chrome-extension://${extensionID}/options.html`, async () => {
        await window.sleep(1000);
        document.querySelectorAll('li')[1].click();
        await window.sleep(1000);
        Array.from(document.querySelectorAll('i')).find(e => e.textContent === 'add').click();
        await window.sleep(1000);
        Array.from(document.querySelectorAll('input')).reverse()[0].value = '[Deutsch]';
      }, [3, 2]],
      demo: [`chrome-extension://${extensionID}/${watchPageURL}`, async () => {
        await window.sleep(1000);
        Array.from(document.querySelectorAll('button')).find(e => e.textContent.trim() === 'Let\'s Go!').click();
      }, [1, 1], async (page) => {
        const context = (await page.frames())[0];
        await context.evaluate(() => {
          const maxTime = 4630.879359;
          const segments = 25;
          const intervalLength = 2500;
          let i = 0;
          return new Promise((resolve) => {
            const interval = setInterval(async () => {
              if (i > segments) {
                clearInterval(interval);
                setTimeout(resolve, 1000);
                return;
              }
              const player = document.querySelector('video');
              player.currentTime = (i / segments) * maxTime;
              player.play();
              i++;
            }, intervalLength);
          });
        });
      }],
      buttons: ['https://www.youtube.com/live_chat_replay?continuation=' +
        'op2w0wRiGlhDaWtxSndvWVZVTkljM2cwU0hGaExURlBVbXBSVkdnNV' +
        'ZGbEVhSGQzRWd0cU9HdG9TVFZwY2kxUE9Cb1Q2cWpkdVFFTkNndHFP' +
        'R3RvU1RWcGNpMVBPQ0FCQAFyAggEeAE%253D',
      async () => {
        await window.sleep(15000);
      }, [2, 1]
      ]
    };

    const args = process.argv.slice(2);
    let images = [];
    const items = args[0].split(',');
    items.forEach(item => images.push(item.trim()));
    if (images[0] === 'all') images = Object.keys(pages);

    for (let i = 0; i < images.length; i++) {
      const item = images[i].toString();
      await exportImage(item, page, ...(pages[item]));
    }

    console.log('Closing the browser...');
    await browser.close();
    xvfb.stop();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
