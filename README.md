# HyperChat - Improved YouTube Chat

### [Download HyperChat](https://livetl.app/)

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

> Note: A Linux or Unix-like environment is required. If you are on Windows, use WSL.

Install from the monorepo root:

```bash
npm ci
```

Serve the extension for local development:

```bash
npm run dev:chrome -w @livetl/hyperchat    # watch Chrome MV3
npm run dev:firefox -w @livetl/hyperchat   # watch Firefox MV3
npm run dev:mv2 -w @livetl/hyperchat       # watch Firefox MV2

npm run start:chrome -w @livetl/hyperchat  # watch + open Chrome
npm run start:firefox -w @livetl/hyperchat # watch + open Firefox
```

### Building for Production

The root release workflow builds HyperChat from tags in the format `vX.Y.Z`.

To simulate the build:

```bash
VERSION=X.Y.Z npm run build -w @livetl/hyperchat         # all three targets
VERSION=X.Y.Z npm run build:chrome -w @livetl/hyperchat  # Chrome MV3
VERSION=X.Y.Z npm run build:firefox -w @livetl/hyperchat # Firefox MV3
VERSION=X.Y.Z npm run build:mv2 -w @livetl/hyperchat     # Firefox MV2
```

The built ZIP files can be found in the `build` directory. Only the two MV3 zips
are published as release assets; the MV2 build is verified in CI. LiveTL bundles
this workspace source directly with its own target-specific configuration.

## Release

Release steps are documented in the root [release playbook](../../AGENT_RELEASE.md).
