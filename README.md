# HyperChat - Improved YouTube Chat

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Contributors](https://img.shields.io/github/contributors/LiveTL/HyperChat)](https://github.com/LiveTL/HyperChat/contributors)
[![Issues](https://img.shields.io/github/issues/LiveTL/HyperChat)](https://github.com/LiveTL/HyperChat/issues)
![Size](https://img.shields.io/github/repo-size/LiveTL/HyperChat)
[![Commit Activity](https://img.shields.io/github/commit-activity/w/LiveTL/HyperChat)](https://github.com/LiveTL/HyperChat/commits/)
[![Discord](https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uJrV3tmthg)


## Install

HyperChat is available in the Chrome and Firefox stores.

See https://livetl.app/hyperchat/install


## Building from Source

### ⚠️ WARNING ⚠️

For legacy reasons, we have a `mv2` branch used by [the LiveTL extension](https://github.com/LiveTL/LiveTL)'s Manifest V2 Firefox variant, while the `main` branch houses the main Manifest V3 version that's published to stores.

### Development

> Note: The repo expects a Linux or Unix-like environment. If you are on Windows, use WSL.

Clone the repository:

```bash
git clone https://github.com/LiveTL/HyperChat
```

Open the repository and npm install:

```bash
cd HyperChat
npm install # install dependencies
```

Serve the extension for local development:

```bash
npm run dev:chrome    # devserver for Chrome extension
npm run dev:firefox   # devserver for Firefox extension

npm run start:chrome  # devserver + open extension in Chrome
npm run start:firefox # devserver + open extension in Firefox
```

### Building for Production

Our build script is [an automated GitHub action](.github/workflows/release.yml), where `${{ github.ref }}` should evaluate to a tag in the format `vX.Y.Z` (where `X.Y.Z` is the version number).

To simulate the build:

```bash
VERSION=X.Y.Z npm run build         # Chrome & Firefox
VERSION=X.Y.Z npm run build:chrome  # just Chrome
VERSION=X.Y.Z npm run build:firefox # just Firefox
```

The built ZIP files can be found in the `build` directory.

## Release

Release steps for `mv2` and `main` are documented in [RELEASE_PROCESS.md](./RELEASE_PROCESS.md).
