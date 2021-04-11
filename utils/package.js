const { spawn } = require('child_process');

const shouldBeInRoot = process.argv.indexOf('firefox') != -1;

spawn(
  'sh',
  [
    '-c',
    'mkdir -p dist && cd build && zip -9r ../dist/LiveTL.zip .'
  ]
);
