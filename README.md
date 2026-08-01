# LiveTL - Translation Filter for Streams

[![Tests](https://github.com/LiveTL/LiveTL/actions/workflows/tests.yaml/badge.svg)](https://github.com/LiveTL/LiveTL/actions/workflows/tests.yaml)
[![E2E Tests](https://github.com/LiveTL/LiveTL/actions/workflows/tests-e2e.yml/badge.svg)](https://github.com/LiveTL/LiveTL/actions/workflows/tests-e2e.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/standard/semistandard)
[![Contributors](https://img.shields.io/github/contributors/LiveTL/LiveTL)](https://github.com/LiveTL/LiveTL/contributors)
[![Issues](https://img.shields.io/github/issues/LiveTL/LiveTL)](https://github.com/LiveTL/LiveTL/issues)
![Total Lines](https://img.shields.io/tokei/lines/github/LiveTL/LiveTL)
[![Commit Activity](https://img.shields.io/github/commit-activity/w/LiveTL/LiveTL)](https://github.com/LiveTL/LiveTL/commits/)
[![Discord](https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uJrV3tmthg)

### [Download LiveTL](https://livetl.app/)

![Demo](./img/demo.png)

## Feedback and Contributing

We have a Discord server for those who would like to give feedback or discuss new
features! [Here is the invite](https://discord.gg/uJrV3tmthg).

If you are interested in helping us solve any issues and/or add features, please let us know in the Discord server and
submit a Pull Request!

## Development

LiveTL maintains one implementation on `mv3-fr`. That branch produces Chrome
MV3, Firefox MV3, and Firefox MV2 builds; manifest versions are build targets,
not separate source branches.

### Setup

> Note: The repo expects a Linux or Unix-like environment. If you are on Windows, use WSL.

> ℹ LiveTL uses submodules. Make sure to clone the repo with the `--recursive` flag!
>
> ℹ When pulling, you should also use `git pull --recurse`.

```bash
yarn # use yarn, not npm
```

### Commands

```bash
yarn start # watch Chrome MV3
yarn dev:firefox # watch Firefox MV3
yarn dev:mv2 # watch Firefox MV2
VERSION=0.0.0 yarn build # build and verify every target
yarn package # package Chrome MV3 and Firefox MV2 zips
yarn test # jest
yarn test:watch # autotest
yarn format # lint
yarn e2e # run e2e tests
```

Load `build/chrome` in Chrome developer mode. Firefox validation targets are in
`build/firefox` (MV3) and `build/mv2` (MV2).

## Developers

LiveTL is developed by [these fine people](https://github.com/LiveTL/LiveTL/graphs/contributors)!
