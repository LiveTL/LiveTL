const { mkdirSync, rmSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

mkdirSync('build', { recursive: true });

for (const [target, filename] of [
  ['chrome', 'LiveTL-Chrome.zip'],
  ['mv2', 'LiveTL-Firefox.xpi'],
]) {
  const output = path.resolve('build', filename);
  rmSync(output, { force: true });
  const result = spawnSync('zip', ['-9r', output, '.'], {
    cwd: path.resolve('build', target),
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
