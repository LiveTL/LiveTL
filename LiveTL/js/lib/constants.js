const languages = [
  { code: 'en', name: 'English', lang: 'English' },
  { code: 'jp', name: 'Japanese', lang: '日本語' },
  { code: 'es', name: 'Spanish', lang: 'Español' },
  { code: 'id', name: 'Indonesian', lang: 'bahasa Indonesia' },
  { code: 'kr', name: 'Korean', lang: '한국' },
  { code: 'ch', name: 'Chinese', lang: '中文' }
];

const languageConversionTable = {};

// WAR: web accessible resource
async function getWAR(u) {
  return new Promise((res, rej) => chrome.runtime.sendMessage({ type: 'get_war', url: u }, r => res(r)));
}

async function getFile(name, format) {
  return await (await fetch(await getWAR(name)))[format]();
}

module.exports = { languages };
