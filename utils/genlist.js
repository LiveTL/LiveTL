const fs = require('fs');
const request = require('request');

const keepAttrs = (...attrs) => obj => Object.fromEntries(Object.entries(obj)
  .filter(([key, _val]) => attrs.includes(key))
);

const jsonToArr = (...keys) => obj => keys
  .map(key => obj[key]);

const req = request.defaults({
  headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:92.0) Gecko/20100101 Firefox/92.0' }
});

const downloadJson = (url, fp, keys) => req(url, { json: true }, (err, _res, body) => {
  if (err) return console.error(err);
  fs.writeFileSync(fp, JSON.stringify({
    keys,
    users: body.map(keepAttrs(...keys)).map(jsonToArr(...keys))
  }));
});

downloadJson(
  'https://opencollective.com/livetl/members/all.json',
  './src/plugins/opencollective.json',
  ['totalAmountDonated', 'profile', 'role', 'name']
);

downloadJson(
  'https://api.github.com/repos/LiveTL/LiveTL/contributors',
  './src/plugins/gh.json',
  ['login', 'type']
);
