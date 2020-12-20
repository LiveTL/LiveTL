from pathlib import Path
import sys

import setup_utils as su

pwd = Path(".") / "drivers"

def setup_driver() -> None:
    __install_linux()


def __install_linux() -> None:
    su.download(
        "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz",
        pwd / "gecko_linux.tar.gz"
    )
    su.untar(pwd / "gecko_linux.tar.gz", pwd)


def __install_macos() -> None:
    pass


def __install_windows() -> None:
    pass


if __name__ == "__main__":
    setup_driver()
