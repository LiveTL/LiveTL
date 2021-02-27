function parseParams(loc) {
  const s = decodeURI((loc || location.search).substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"');
  return s === '' ? {} : JSON.parse('{"' + s + '"}');
}

(async () => {
  let params = parseParams();
  document.querySelector('.version').textContent = params.version;
  let details = await fetch('https://api.github.com/repos/LiveTL/LiveTL/releases/tags/' + params.version);
  details = await details.json();
  document.querySelector('.changelogs').innerHTML = details.body;
  document.querySelector('.published').textContent = (new Date(details.published_at)).toString();
})();
