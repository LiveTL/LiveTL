import os
import subprocess
from pathlib import Path


def test_mv3_smoke():
    repo_root = Path(__file__).resolve().parents[1]
    env = os.environ.copy()
    env.setdefault("TEST_URL", "https://www.youtube.com/watch?v=X4VbdwhkE10")

    result = subprocess.run(
        ["xvfb-run", "-a", "node", "scripts/codex-smoke.mjs"],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True,
        timeout=240
    )

    assert result.returncode == 0, result.stdout + result.stderr
