# LiveTL - Translation Filter for Streams

### [Download LiveTL](https://livetl.app/)

![Demo](./img/demo.png)

## Development

LiveTL maintains one implementation on `main`. That branch produces Chrome
MV3, Firefox MV3, and Firefox MV2 builds; manifest versions are build targets,
not separate source branches.

The LiveTL release workflow builds from tags in the format `livetl-vX.Y.Z`.

### Setup

> Note: The repo expects a Linux or Unix-like environment. If you are on Windows, use WSL.

Install from the monorepo root:

```bash
npm ci
```

### Commands

```bash
npm run start # watch Chrome MV3
npm run dev:firefox # watch Firefox MV3
npm run dev:mv2 # watch Firefox MV2

VERSION=0.0.0 npm run build -w @livetl/livetl # build, verify, and package LiveTL targets

npm run test # jest
npm run test:watch # autotest
npm run e2e # run e2e tests

npm run format # format
npm run lint # lint
```

Load `build/chrome` in Chrome developer mode. Firefox validation targets are in
`build/firefox` (MV3) and `build/mv2` (MV2).

## Developers

LiveTL is developed by [these fine people](https://github.com/LiveTL/LiveTL/graphs/contributors)!
