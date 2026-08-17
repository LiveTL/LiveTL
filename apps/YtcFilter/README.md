# YtcFilter | YouTube Chat Filter

## Installation

[Chrome Web Store](https://chrome.google.com/webstore/detail/ytcfilter/mnldnbhgfocmkehnlkeanlhfmopepnko)
<!-- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/ytcfilter/) -->

Release packages are also available
[on GitHub](https://github.com/LiveTL/LiveTL/releases).

## Building from Source

YtcFilter lives in `apps/YtcFilter` in the LiveTL monorepo and builds from the
YtcFilter release workflow.

### Development

> Note: A Linux or Unix-like environment is required. If you are on Windows, use WSL.

Install from the monorepo root:

```bash
npm ci
```

Serve the extension for local development:

```bash
npm run dev:chrome -w @livetl/ytcfilter    # watch Chrome
npm run dev:firefox -w @livetl/ytcfilter   # watch Firefox

npm run start:chrome -w @livetl/ytcfilter  # watch + open Chrome
npm run start:firefox -w @livetl/ytcfilter # watch + open Firefox
```

### Building for Production

To simulate the build:

```bash
VERSION=X.Y.Z npm run build -w @livetl/ytcfilter         # Chrome & Firefox
VERSION=X.Y.Z npm run build:chrome -w @livetl/ytcfilter  # Chrome
VERSION=X.Y.Z npm run build:firefox -w @livetl/ytcfilter # Firefox
```

The built packages can be found in `apps/YtcFilter/build`.
