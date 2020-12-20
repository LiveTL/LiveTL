from pathlib import Path

import setup_utils as su

pwd = Path(".") / "drivers"


def setup_driver() -> None:
    __setup_driver()

__setup_driver = su.setup_driver(
    {
        "win": [
            "https://github.com/mozilla/geckodriver/releases"
            "/download/v0.28.0/geckodriver-v0.28.0-win64.zip",
            su.unzip,
        ],
        "darwin": [
            "https://github.com/mozilla/geckodriver/releases/"
            "download/v0.28.0/geckodriver-v0.28.0-macos.tar.gz",
            su.untar,
        ],
        "linux": [
            "https://github.com/mozilla/geckodriver/releases"
            "/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz",
            su.untar,
        ],
    },
    {
        "win": pwd / "geckodriver.exe",
        "darwin": pwd / "geckodriver",
        "linux": pwd / "geckodriver",
    },
)


if __name__ == "__main__":
    setup_driver()
