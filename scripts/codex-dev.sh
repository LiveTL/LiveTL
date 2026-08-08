#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_DIR="$REPO_ROOT/.codex-runtime"
PROFILE_DIR="${USER_DATA_DIR:-$REPO_ROOT/.codex-profile}"
REMOTE_DEBUGGING_PORT="${REMOTE_DEBUGGING_PORT:-9222}"
CHROME_BIN="${CHROME_BIN:-google-chrome}"
TEST_URL="${TEST_URL:-}"

WATCH_PID_FILE="$STATE_DIR/watch.pid"
WATCH_LOG_FILE="$STATE_DIR/watch.log"
BROWSER_PID_FILE="$STATE_DIR/browser.pid"
BROWSER_LOG_FILE="$STATE_DIR/browser.log"
WATCH_NPM_SCRIPT=""
BUILD_NPM_SCRIPT=""
EXT_PATH=""
MODE_LABEL=""
DEFAULT_TEST_URL=""

mkdir -p "$STATE_DIR"

detect_repo_scripts() {
  if (
    cd "$REPO_ROOT" &&
    node -e 'const s=require("./package.json").scripts||{}; process.exit(s["dev:chrome"] && s["build:chrome"] ? 0 : 1);'
  ); then
    WATCH_NPM_SCRIPT="dev:chrome"
    BUILD_NPM_SCRIPT="build:chrome"
    EXT_PATH="$REPO_ROOT/build/chrome"
    MODE_LABEL="mv3"
    DEFAULT_TEST_URL="https://www.youtube.com/watch?v=X4VbdwhkE10"
    return 0
  fi

  if (
    cd "$REPO_ROOT" &&
    node -e 'const s=require("./package.json").scripts||{}; process.exit(s["start:none"] && s["build"] ? 0 : 1);'
  ); then
    WATCH_NPM_SCRIPT="start:none"
    BUILD_NPM_SCRIPT="build"
    EXT_PATH="$REPO_ROOT/build"
    MODE_LABEL="mv2"
    DEFAULT_TEST_URL="https://www.youtube.com/watch?v=X4VbdwhkE10"
    return 0
  fi

  if (
    cd "$REPO_ROOT" &&
    node -e 'const s=require("./package.json").scripts||{}; process.exit(s["start"] && s["build"] ? 0 : 1);'
  ); then
    WATCH_NPM_SCRIPT="start"
    BUILD_NPM_SCRIPT="build"
    EXT_PATH="$REPO_ROOT/build"
    MODE_LABEL="mv2"
    DEFAULT_TEST_URL="https://www.youtube.com/watch?v=X4VbdwhkE10"
    return 0
  fi

  echo "Unable to detect compatible npm scripts for watch/build in package.json." >&2
  exit 1
}

resolve_chrome_bin() {
  local candidates=(
    "$CHROME_BIN"
    google-chrome
    google-chrome-stable
    chromium-browser
    chromium
  )
  local candidate
  for candidate in "${candidates[@]}"; do
    if command -v "$candidate" >/dev/null 2>&1; then
      CHROME_BIN="$candidate"
      return 0
    fi
  done
  echo "Chrome executable not found. Set CHROME_BIN to a Chrome/Chromium binary." >&2
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

start_watch() {
  detect_repo_scripts
  if is_pid_running "$WATCH_PID_FILE"; then
    echo "watch: already running (pid $(cat "$WATCH_PID_FILE"))"
    return 0
  fi
  echo "watch: starting npm run $WATCH_NPM_SCRIPT"
  (
    cd "$REPO_ROOT"
    nohup npm run "$WATCH_NPM_SCRIPT" >"$WATCH_LOG_FILE" 2>&1 &
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

setup_mcp() {
  if codex mcp list 2>/dev/null | rg -q '^chrome-devtools'; then
    echo "mcp: chrome-devtools already configured in Codex"
    return 0
  fi

  echo "mcp: adding chrome-devtools MCP server to Codex config"
  codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest \
    --browserUrl="http://127.0.0.1:${REMOTE_DEBUGGING_PORT}"
}

start_browser() {
  detect_repo_scripts
  resolve_chrome_bin
  if [[ -z "$TEST_URL" ]]; then
    TEST_URL="$DEFAULT_TEST_URL"
  fi
  if [[ ! -f "$EXT_PATH/manifest.json" ]]; then
    echo "browser: extension build not found, running npm run $BUILD_NPM_SCRIPT"
    (
      cd "$REPO_ROOT"
      npm run "$BUILD_NPM_SCRIPT"
    )
  fi

  rm -rf "$PROFILE_DIR"
  mkdir -p "$PROFILE_DIR"

  local browser_args=(
    --user-data-dir="$PROFILE_DIR"
    --remote-debugging-port="$REMOTE_DEBUGGING_PORT"
    --disable-gpu
    --headless=new
    --disable-extensions-except="$EXT_PATH"
    --load-extension="$EXT_PATH"
    --no-first-run
    --no-default-browser-check
    --disable-background-timer-throttling
    --disable-renderer-backgrounding
    --disable-dev-shm-usage
    --disable-features=IsolateOrigins,site-per-process,TranslateUI
    --disable-web-security
    --allow-running-insecure-content
    --allow-insecure-localhost
    --no-sandbox
    --disable-setuid-sandbox
    --noerrdialogs
    --disable-notifications
    --disable-translate
    --disable-infobars
    --autoplay-policy=no-user-gesture-required
    --enable-automation
  )
  if [[ -n "$TEST_URL" ]]; then
    browser_args+=("$TEST_URL")
  fi

  echo "browser: starting headless Chrome with extension (url: $TEST_URL)"
  nohup "$CHROME_BIN" "${browser_args[@]}" >"$BROWSER_LOG_FILE" 2>&1 &

  echo $! >"$BROWSER_PID_FILE"
  local pid
  pid="$(cat "$BROWSER_PID_FILE")"
  sleep 1
  if ! kill -0 "$pid" >/dev/null 2>&1; then
    echo "browser: failed to stay up. Check log: $BROWSER_LOG_FILE" >&2
    tail -n 40 "$BROWSER_LOG_FILE" >&2 || true
    rm -f "$BROWSER_PID_FILE"
    return 1
  fi
  echo "browser: started (pid $pid, binary $CHROME_BIN)"
}

stop_browser() {
  if ! is_pid_running "$BROWSER_PID_FILE"; then
    rm -f "$BROWSER_PID_FILE"
    echo "browser: not running"
    return 0
  fi
  local pid
  pid="$(cat "$BROWSER_PID_FILE")"
  kill "$pid" >/dev/null 2>&1 || true
  rm -f "$BROWSER_PID_FILE"
  echo "browser: stopped"
}

reload_browser() {
  stop_browser
  start_browser
}

status() {
  detect_repo_scripts
  if is_pid_running "$WATCH_PID_FILE"; then
    echo "watch: running (pid $(cat "$WATCH_PID_FILE"))"
  else
    echo "watch: stopped"
  fi
  echo "mode: $MODE_LABEL (watch=$WATCH_NPM_SCRIPT build=$BUILD_NPM_SCRIPT ext=$EXT_PATH)"
  if [[ -z "$TEST_URL" ]]; then
    TEST_URL="$DEFAULT_TEST_URL"
  fi
  echo "test-url: $TEST_URL"
  if codex mcp list 2>/dev/null | rg -q '^chrome-devtools'; then
    echo "mcp: configured in Codex as chrome-devtools"
  else
    echo "mcp: NOT configured in Codex (run: codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --browserUrl=http://127.0.0.1:${REMOTE_DEBUGGING_PORT})"
  fi
  if is_pid_running "$BROWSER_PID_FILE"; then
    echo "browser: running (pid $(cat "$BROWSER_PID_FILE"))"
  else
    echo "browser: stopped"
  fi
  echo "logs: $STATE_DIR"
}

usage() {
  cat <<'EOF'
Usage: scripts/codex-dev.sh <command>

Commands:
  setup-mcp  Configure Codex MCP server `chrome-devtools` if missing.
  watch      Start the live build watcher in background.
  go-test    Ensure MCP/watch are ready, then fully restart headless Chrome.
  reload     Fully restart headless Chrome (hard extension reload).
  stop       Stop browser and watcher.
  status     Show process status and log directory.
  logs       Print paths for watch/browser logs.

Environment:
  TEST_URL   Optional override for the page opened in headless test browser.
EOF
}

cmd="${1:-}"
case "$cmd" in
  watch)
    start_watch
    ;;
  setup-mcp)
    setup_mcp
    ;;
  go-test)
    setup_mcp
    start_watch
    reload_browser
    ;;
  reload)
    setup_mcp
    start_watch
    reload_browser
    ;;
  stop)
    stop_browser
    stop_watch
    ;;
  status)
    status
    ;;
  logs)
    echo "watch log: $WATCH_LOG_FILE"
    echo "browser log: $BROWSER_LOG_FILE"
    ;;
  *)
    usage
    exit 1
    ;;
esac
