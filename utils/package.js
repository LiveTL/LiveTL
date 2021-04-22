const { spawn } = require('child_process');

// eslint-disable-next-line no-unused-vars
const shouldBeInRoot = process.argv.indexOf('firefox') != -1;

const cmds = [
  'mkdir -p dist',
  'cd build',
  'zip -9r ../dist/LiveTL-Firefox.zip .',
  'cp ../dist/LiveTL-Firefox.zip ../dist/LiveTL-Chrome.zip',
  'zip -d ../dist/LiveTL-Chrome.zip manifest.json',
  'printf "@ manifest.chrome.json\\n@=manifest.json\\n" | zipnote -w ../dist/LiveTL-Chrome.zip',
  'zip -d ../dist/LiveTL-Firefox.zip manifest.chrome.json'
];

spawn(
  'sh',
  [
    '-c',
    cmds.join(' && ')
  ]
);
