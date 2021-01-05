const Marine = (() => {
  let oldFaviconURL = null;

  function isHolni() {
    return isHolniParam() || isHolniYT();
  }

  function isHolniParam() {
    const params = parseParams(window.location.href);
    return params.marine == 'holni';
  }

  function isHolniYT() {
    return document
      .querySelectorAll('a[href="/channel/UCCzUftO8KOVkV4wQG1vkUvg"]')
      .length > 0;
  }

  function holniParam() {
    return isHolni() ? 'marine=holni' : 'marine=not_holni';
  }

  async function makeFaviconBL() {
    oldFaviconURL = oldFaviconURL || faviconElement().href;
    faviconElement().href = await getMarineFaviconURL();
  }

  function resetFavicon() {
    faviconElement().href = oldFaviconURL;
  }

  function faviconElement() {
    return document.querySelector("link[rel*='icon']");
  }

  async function getMarineFaviconURL() {
    return await getWAR('icons/blfavicon.ico');
  }

  return { holniParam, isHolni, makeFaviconBL, resetFavicon };
})();

if (!isAndroid) {
  if (Marine.isHolni()) {
    Marine.makeFaviconBL();
  } else {
    Marine.resetFavicon();
  }
}
