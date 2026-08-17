# YtcFilter | YouTube Chat Filter 

## Installation

[Chrome Web Store](https://chrome.google.com/webstore/detail/ytcfilter/mnldnbhgfocmkehnlkeanlhfmopepnko)
<!-- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/ytcfilter/) -->

Release packages are also available [on GitHub](https://github.com/LiveTL/ytcfilter/releases).

## Building from Source

YtcFilter is MV3-only. `master` is the shipping branch.

### Development

> Note: The repo expects a Linux or Unix-like environment. If you are on Windows, use WSL.

Clone the repository:

```bash
git clone git@github.com:LiveTL/ytcfilter.git
```

Open the repository and npm install:

```bash
cd ytcfilter
npm install --force # install dependencies
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
