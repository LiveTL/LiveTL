const Marine = (() => {
  const faviconElement = document.querySelector("link[rel*='icon']");
  const oldFaviconURL = faviconElement.href;

  async function makeFaviconBL() {
    faviconElement.href = await getMarineFaviconURL();
  }

  function resetFavicon() {
    faviconElement.href = oldFaviconURL;
  }

  async function getMarineFaviconURL() {
    return await getWAR('icons/blfavicon.ico');
  }

  return { makeFaviconBL, resetFavicon };
})();

Marine.makeFaviconBL().then(Marine.resetFavicon);
