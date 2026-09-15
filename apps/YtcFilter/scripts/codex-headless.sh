#!/usr/bin/env bash
set -euo pipefail

# Backward-compatible entrypoint.
# Use codex-dev.sh as the primary workflow controller.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/codex-dev.sh" go-test
