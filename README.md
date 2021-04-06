# LiveTL
[![Tests](https://github.com/LiveTL/extension/actions/workflows/tests.yaml/badge.svg)](https://github.com/LiveTL/extension/actions/workflows/tests.yaml)

## Development

### Setup

> ℹ LiveTL uses submodules. Make sure to clone the repo with the `--recursive` flag!

> ℹ When pulling, you should also use `git pull --recurse`.

```bash
yarn # use yarn, not npm
```

### Commands
#### Variables
```bash
# defaults:
PORT=3000
NODE_ENV=development
```
```bash
yarn start # dev
yarn build # prod
yarn test  # jest
yarn test:watch # autotest
```
Load the `build` directory in Chrome developer mode.

### Hot Reload
Enable `chrome://flags/#allow-insecure-localhost`