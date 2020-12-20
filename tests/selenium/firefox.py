import os
import sys
from pathlib import Path
from typing import Callable

import setup_utils as su

pwd = Path(".") / "drivers"
platform = sys.platform.replace("32", "")


def setup_driver() -> None:
    if not __is_present():
        platform_install[platform]()


def __is_present():
    return platform_drivers[platform].exists()


def __install_linux() -> None:
    __download_and_extract(
        "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz",
        su.untar,
    )


def __install_macos() -> None:
    __download_and_extract(
        "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-macos.tar.gz",
        su.untar,
    )


def __install_windows() -> None:
    __download_and_extract(
        "https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-win64.zip",
        su.unzip,
    )


def __download_and_extract(url: str, extract: Callable[[str, str], None]) -> None:
    su.download(url, pwd / "temp")
    extract(pwd / "temp", pwd)


platform_install = {
    "win": __install_windows,
    "darwin": __install_macos,
    "linux": __install_linux,
}

platform_drivers = {
    "win": pwd / "geckodriver.exe",
    "darwin": pwd / "geckodriver",
    "linux": pwd / "geckodriver",
}


if __name__ == "__main__":
    setup_driver()
