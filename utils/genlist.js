const { spawn } = require('child_process');
const fs = require('fs');
const request = require('request');

const cmds = [
  'curl -o src/plugins/opencollective.json https://opencollective.com/livetl/members/all.json',
  'curl -o src/plugins/gh.json https://api.github.com/repos/LiveTL/LiveTL/contributors',
  'sed -i \':a;N;$!ba;s/\\n//g\' src/plugins/gh.json'
];

const keepAttrs = (...attrs) => obj => Object.fromEntries(Object.entries(obj)
  .filter(([key, val]) => attrs.includes(key))
);

const jsonToArr = (...keys) => obj => keys
  .map(key => obj[key]);

request('https://opencollective.com/livetl/members/all.json', { json: true }, (err, res, body) => {
  if (err) return console.error(err);
  const keys = ['totalAmountDonated', 'profile', 'role', 'name'];
  fs.writeFileSync('./src/plugins/opencollective.json', JSON.stringify({
    keys,
    users: body.map(keepAttrs(...keys)).map(jsonToArr(...keys))
  }));
});
