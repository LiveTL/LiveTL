async function getWAR(u) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'get_war', url: u }, r => resolve(r));
  });
}

module.exports = { getWAR };
