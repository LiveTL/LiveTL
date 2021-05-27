const { spawn } = require('child_process');

const cmds = [
  'curl -o src/plugins/opencollective.json https://opencollective.com/livetl/members/all.json',
  'curl -o src/plugins/gh.json https://api.github.com/repos/LiveTL/LiveTL/contributors',
  `sed -i ':a;N;$!ba;s/\\n//g' src/plugins/gh.json`
];

spawn(
  'sh',
  [
    '-c',
    cmds.join(' && ')
  ]
);
