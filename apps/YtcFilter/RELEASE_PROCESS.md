# YtcFilter Release Process

YTCF ships from a single active line.

## Branch And Sync Order

1. Work on `master`.
2. `git fetch hc`
3. If shared chat runtime behavior changed, merge `hc/main` into `master` first.
4. Resolve conflicts in YTCF terms.
5. Validate locally.
6. Push `master`.
7. Tag and publish the release from `master`.

## Local Validation

Clean reinstall if Node or dependencies look stale:

```bash
rm -rf node_modules
n exec 22.21.1 npm install --force
```

Build both targets:

```bash
n exec 22.21.1 npm run build:chrome
n exec 22.21.1 npm run build:firefox
```

Optional combined build:

```bash
n exec 22.21.1 npm run build
```

Runtime smoke in Chromium:

```bash
CHROME_BIN=/snap/bin/chromium bash scripts/codex-dev.sh go-test
```

If the helper is flaky under snap Chromium, use the direct manual smoke command:

```bash
rm -rf /tmp/ytcf-manual-profile
xvfb-run -a /snap/bin/chromium \
  --disable-gpu \
  --ozone-platform=headless \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/ytcf-manual-profile \
  --disable-extensions-except="$PWD/build" \
  --load-extension="$PWD/build" \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-dev-shm-usage \
  --disable-features=IsolateOrigins,site-per-process,TranslateUI \
  --disable-web-security \
  --allow-running-insecure-content \
  --allow-insecure-localhost \
  --no-sandbox \
  --disable-setuid-sandbox \
  --noerrdialogs \
  --disable-notifications \
  --disable-translate \
  --disable-infobars \
  --autoplay-policy=no-user-gesture-required \
  "https://www.youtube.com/watch?v=X4VbdwhkE10"
```

Build output layout:

- Chrome unpacked extension: `build/`
- Firefox unpacked extension: `build/firefox/`
- release ZIPs: `build/YtcFilter-chrome.zip` and `build/YtcFilter-firefox.zip`

Recommended spot checks after a shared chat runtime sync:

- setup flow still opens
- options page still renders filters / archives / other tabs
- `hyperchat.html` still renders the filtered panel UI
- native YouTube chat still gets the YTCF button bar
- block/report actions still work from the message menu
- filter edits should be retested only after reloading/remounting the panel; mounted sessions do not live-patch by design

## Versioning

- Release version is driven by the tag.
- The release workflow strips the leading `v` and passes the result as `VERSION`.
- `vite.config.ts` writes that `VERSION` into the built extension manifest.
- Practical rule:
  - tag `v3.0.7` builds extension version `3.0.7`

`package.json` is not the authoritative release number for published builds here.

## Release Workflow

- Workflow: `.github/workflows/release.yml`
- Trigger:
  - GitHub release event `published`
  - optional `workflow_dispatch` with a `tag` input for rebuilds
- Assets uploaded:
  - `YtcFilter-Chrome.zip`
  - `YtcFilter-Firefox.zip`

## Release Notes And Changelog Style (Mandatory)

- In-product changelog (`src/components/changelog/YtcFilterChangelog.svelte`):
  - single line, plain text only (no HTML, no lists)
  - user-facing only
  - extremely short (one clause)
  - start with lowercase unless a proper noun forces capitalization
  - do not use `/` separators
  - example: `fix visual conflicts w/ YT`
- GitHub release notes must match the existing format:

```md
## Here's what's new in vX.Y.Z:
- fix visual conflicts w/ YT
```

## Recommended Publish Flow

1. Make sure `master` contains the intended YTCF changes and any needed shared chat runtime sync.
2. Run the local validation commands above.
3. Push `master`.
4. Create and push the release tag:
   - `git tag vX.Y.Z`
   - `git push origin vX.Y.Z`
5. Publish the GitHub release for that tag.
6. Confirm the release workflow uploads both ZIP assets.

## Rebuild Existing Release Tag

If the tag already exists and you only need to rebuild assets:

1. Ensure the tag points at the intended commit.
2. Use the `Latest Release Build` workflow with `workflow_dispatch`.
3. Pass the existing tag name, for example:
   - `v3.0.7`

The workflow checks out that tag and replaces the uploaded assets.

## Overwrite A Bad Pre-release (Delete And Recreate)

Use this when the notes/changelog were wrong and you want a clean rebuild.

1. Delete the GitHub release and delete the tag:

```bash
gh release delete vX.Y.Z-betaN --cleanup-tag -y
```

2. Recreate the tag at the intended commit and push it:

```bash
git tag -f vX.Y.Z-betaN <commit>
git push -f origin vX.Y.Z-betaN
```

3. Recreate the pre-release with the correct notes (tag must exist first):

```bash
gh release create vX.Y.Z-betaN --title vX.Y.Z-betaN --prerelease --notes "## Here's what's new in vX.Y.Z-betaN:\n- fix visual conflicts w/ YT\n"
```

4. Confirm the `Latest Release Build` workflow uploads both ZIP assets.
