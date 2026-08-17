const { spawn } = require('child_process');

const cmds = [
  'mkdir -p dist',
  'cd build',
  'zip -9r ../dist/YtcFilter-Chrome.zip .',
  'cp ../dist/YtcFilter-Chrome.zip ../dist/YtcFilter-Firefox.zip',
  'zip -d ../dist/YtcFilter-Firefox.zip manifest.json',
  'printf "@ manifest.firefox.json\\n@=manifest.json\\n" | zipnote -w ../dist/YtcFilter-Firefox.zip',
  'zip -d ../dist/YtcFilter-Chrome.zip manifest.firefox.json'
];

spawn(
  'sh',
  [
    '-c',
    cmds.join(' && ')
  ]
);
