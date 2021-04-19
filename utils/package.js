const { spawn } = require('child_process');

// eslint-disable-next-line no-unused-vars
const shouldBeInRoot = process.argv.indexOf('firefox') != -1;

spawn(
  'sh',
  [
    '-c',
    'mkdir -p dist && cd build && zip -9r ../dist/LiveTL.zip .'
  ]
);
