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

### Build targets

Everything ships from `main`. There is one source tree and three build targets:

Use `main`; do not check out the historical `mv2` branch. `mv2` below names a
build target.

| Target    | Manifest          | Consumer                                                                               |
| --------- | ----------------- | -------------------------------------------------------------------------------------- |
| `chrome`  | MV3               | Chrome Web Store                                                                       |
| `firefox` | MV3               | Firefox Add-ons                                                                        |
| `mv2`     | MV2, Firefox-only | [The LiveTL extension](https://github.com/LiveTL/LiveTL)'s Manifest V2 Firefox variant |

> ⚠️ The `mv2` target is **not** legacy cruft. Firefox's MV3 support is unreliable
> for LiveTL's needs, so LiveTL's Firefox variant consumes the MV2 build.

MV2/MV3 differences live in two places only: `{{mv2}}.` / `{{mv3}}.` prefixed keys
in `src/manifest.json` (resolved by `scripts/resolve-manifest.ts`), and `__MV__`
checks in source, which are build-time constants so each bundle carries only its
own target's code.

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
npm run dev:chrome    # devserver for Chrome extension (MV3)
npm run dev:firefox   # devserver for Firefox extension (MV3)
npm run dev:mv2       # devserver for the Firefox MV2 variant

npm run start:chrome  # devserver + open extension in Chrome
npm run start:firefox # devserver + open extension in Firefox
```

### Building for Production

Our build script is [an automated GitHub action](.github/workflows/release.yml), where `${{ github.ref }}` should evaluate to a tag in the format `vX.Y.Z` (where `X.Y.Z` is the version number).

To simulate the build:

```bash
VERSION=X.Y.Z npm run build         # all three targets
VERSION=X.Y.Z npm run build:chrome  # just Chrome (MV3)
VERSION=X.Y.Z npm run build:firefox # just Firefox (MV3)
VERSION=X.Y.Z npm run build:mv2     # just Firefox MV2
```

The built ZIP files can be found in the `build` directory. Only the two MV3 zips
are published as release assets; the MV2 build is verified in CI and consumed by
LiveTL through a git submodule.

## Release

Release steps are documented in [RELEASE_PROCESS.md](./RELEASE_PROCESS.md).
