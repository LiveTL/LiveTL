# LiveTL
[![Tests](https://github.com/LiveTL/extension/actions/workflows/tests.yaml/badge.svg)](https://github.com/LiveTL/extension/actions/workflows/tests.yaml)

## Development

### Setup
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