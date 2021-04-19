const puppeteer = require('puppeteer');
const pathlib = require('path');
const path = pathlib.join(__dirname, '..', 'build');
const manifest = require(pathlib.join(__dirname, '..', 'src', 'manifest.json'));
const xvfb = new (require('xvfb'))({
  silent: true,
  xvfb_args: ['-screen', '0', '1280x720x24', '-ac'],
});
xvfb.start((err)=>{ if (err) console.error(err); });
 
(async () => {
  try {
    // download the browser
    console.log('Downloading browser...');
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('856583');

    // open the browser
    const browser = await puppeteer.launch({
      executablePath: revisionInfo.executablePath,
      headless: false,
      args: [
        `--disable-extensions-except=${path}`,
        `--load-extension=${path}`,
        '--window-size=800,600',
        // '--no-sandbox',
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
    const extensionEndURL = [
      'watch.html?',
      'continuation=op2w0wRiGlhDaWtxSndvWVZVTkljM2cwU0hGaExURlBVbXBSVkdnNVZGbEVhSGQzRWd0ak56UT',
      'NhbGxyZFRaRmJ4b1Q2cWpkdVFFTkNndGpOelEzYWxscmRUWkZieUFCQAFyAggEeAE%253D&',
      'video=c747jYku6Eo&isReplay=true'
    ].join('');

    //Navigate to the page
    console.log('Opening the page...');
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionEndURL}`);
 
    console.log('Exporting screenshot...');
    await page.screenshot({path: 'extension.png'});
 
    console.log('Closing the browser...');
    await browser.close();
    xvfb.stop();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();