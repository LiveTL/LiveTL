#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_DIR="$REPO_ROOT/.codex-runtime"
WATCH_PID_FILE="$STATE_DIR/watch.pid"
WATCH_LOG_FILE="$STATE_DIR/watch.log"
TEST_URL="${TEST_URL:-https://www.youtube.com/watch?v=X4VbdwhkE10}"
MODE=""
WATCH_CMD=""
BUILD_CMD=""

mkdir -p "$STATE_DIR"

detect_mode() {
  if (
    cd "$REPO_ROOT" &&
    node -e 'const s=require("./package.json").scripts||{}; process.exit(s["dev:chrome"] && s["build:chrome"] ? 0 : 1);'
  ); then
    MODE="mv3"
    WATCH_CMD="yarn dev:chrome"
    BUILD_CMD="yarn build:chrome"
    return 0
  fi

  if (
    cd "$REPO_ROOT" &&
    node -e 'const s=require("./package.json").scripts||{}; process.exit(s["start"] && s["build:production"] ? 0 : 1);'
  ); then
    MODE="mv2"
    WATCH_CMD="yarn start"
    BUILD_CMD="yarn build:production"
    return 0
  fi

  echo "Unable to detect supported watch/build scripts in package.json." >&2
  exit 1
}

is_pid_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] || return 1
  local pid
  pid="$(cat "$pid_file")"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" >/dev/null 2>&1
}

ensure_xvfb() {
  if command -v xvfb-run >/dev/null 2>&1; then
    return 0
  fi
  echo "xvfb-run is required. Install it once with: sudo apt-get install -y xvfb xauth" >&2
  exit 1
}

ensure_playwright() {
  (
    cd "$REPO_ROOT"
    node -e 'require.resolve("playwright-core")'
  ) >/dev/null 2>&1 || {
    echo "playwright-core is missing. Run: yarn" >&2
    exit 1
  }
}

ensure_build() {
  detect_mode
  if [[ -f "$REPO_ROOT/build/manifest.json" ]]; then
    return 0
  fi
  echo "build: running $BUILD_CMD"
  (
    cd "$REPO_ROOT"
    bash -lc "$BUILD_CMD"
  )
}

start_watch() {
  detect_mode
  if is_pid_running "$WATCH_PID_FILE"; then
    echo "watch: already running (pid $(cat "$WATCH_PID_FILE"))"
    return 0
  fi
  echo "watch: starting $WATCH_CMD"
  (
    cd "$REPO_ROOT"
    nohup bash -lc "$WATCH_CMD" >"$WATCH_LOG_FILE" 2>&1 &
    echo $! >"$WATCH_PID_FILE"
  )
  echo "watch: started (pid $(cat "$WATCH_PID_FILE"))"
}

stop_watch() {
  if ! is_pid_running "$WATCH_PID_FILE"; then
    rm -f "$WATCH_PID_FILE"
    echo "watch: not running"
    return 0
  fi
  local pid
  pid="$(cat "$WATCH_PID_FILE")"
  kill "$pid" >/dev/null 2>&1 || true
  rm -f "$WATCH_PID_FILE"
  echo "watch: stopped"
}

go_test() {
  ensure_xvfb
  ensure_playwright
  ensure_build
  if [[ "$MODE" != "mv3" ]]; then
    echo "go-test: Chromium smoke validation is only supported on mv3-fr. Use Firefox runtime validation on develop." >&2
    start_watch
    return 1
  fi
  local status=0
  (
    cd "$REPO_ROOT"
    xvfb-run -a env TEST_URL="$TEST_URL" node scripts/codex-smoke.mjs
  ) || status=$?
  start_watch
  return "$status"
}

status() {
  detect_mode
  if is_pid_running "$WATCH_PID_FILE"; then
    echo "watch: running (pid $(cat "$WATCH_PID_FILE"))"
  else
    echo "watch: stopped"
  fi
  echo "mode: $MODE"
  echo "watch-cmd: $WATCH_CMD"
  echo "build-cmd: $BUILD_CMD"
  echo "test-url: $TEST_URL"
  echo "watch-log: $WATCH_LOG_FILE"
  echo "smoke: xvfb-run -a env TEST_URL=\"$TEST_URL\" node scripts/codex-smoke.mjs"
}

cmd="${1:-}"
case "$cmd" in
  watch)
    start_watch
    ;;
  go-test)
    go_test
    ;;
  stop)
    stop_watch
    ;;
  status)
    status
    ;;
  *)
    cat <<'EOF'
Usage: scripts/codex-dev.sh <command>

Commands:
  watch    Start the MV3 Chrome watch build in background.
  go-test  Run a fresh XVFB-backed Chromium smoke test against the MV3 build.
  stop     Stop the background watch build.
  status   Show watch status and the smoke-test entrypoint.

Environment:
  TEST_URL   Override the YouTube watch page used by go-test.
  CHROME_BIN Override the Chrome/Chromium binary used by scripts/codex-smoke.mjs.
  KEEP_OPEN=1 Keep the XVFB browser open after the smoke test.
EOF
    exit 1
    ;;
esac
