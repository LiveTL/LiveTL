const puppeteer = require('puppeteer');
const pathlib = require('path');
const path = pathlib.join(__dirname, '..', 'build');
const manifest = require(pathlib.join(__dirname, '..', 'src', 'manifest.json'));
const xvfb = new (require('xvfb'))({
  silent: true,
  xvfb_args: ['-screen', '0', '1280x800x24', '-ac'],
});
xvfb.start((err)=>{ if (err) console.error(err); });
 
async function exportImage(page, url, func, name, scale=1) {
  await page.goto(url);
  await page.setViewport({width: 1280, height: 800 });
  console.log(`Exporting '${name}'...`);
  const p = 100 / scale;
  await page.addStyleTag({content: `
    body {
      width: ${p}%;
      height: ${p}%;
      transform-origin: 0px 0px;
      transform: scale(${scale});
    }
  `});
  await page.evaluate(() => window.sleep = ms => new Promise(res => setTimeout(res, ms)));
  await page.evaluate(func);
  return page.screenshot({path: `img/${name}.png`, });
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
      ]
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

    //Navigate to the page
    console.log('Simulating user interactions...');
    const page = await browser.newPage();

    await exportImage(page, `chrome-extension://${extensionID}/options.html`, async () => {
      document.querySelectorAll('.s-tab')[0].click();
      await window.sleep(1000);
    }, 'options', 1.5);

    await exportImage(page, `chrome-extension://${extensionID}/options.html`, async () => {
      document.querySelectorAll('.s-tab')[1].click();
      await window.sleep(1000);
    }, 'filters', 1.5);

    await exportImage(page, `chrome-extension://${extensionID}/${watchPageURL}`, () => {
      const maxTime = 4630.879359;
      const segments = 25;
      const intervalLength = 2500;
      document.querySelectorAll('.s-dialog .s-btn')[1].click();
      let i = 0;
      return new Promise((resolve) =>{
        const interval = setInterval(async () => {
          if (i > segments) {
            clearInterval(interval);
            await window.sleep(1000);
            resolve();
            return;
          }
          window.player.seekTo((i / segments) * maxTime);
          window.player.playVideo();
          i++;
        }, intervalLength);
      });
    }, 'demo');
 
    console.log('Closing the browser...');
    await browser.close();
    xvfb.stop();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();