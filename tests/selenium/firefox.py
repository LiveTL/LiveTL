from pathlib import Path

import setup_utils as su
from selenium import webdriver

pwd = Path(".") / "drivers"


def setup_driver() -> None:
    __setup_driver()


def get_selenium(display: bool = False) -> webdriver.Firefox:
    browser = webdriver.Firefox(executable_path=__platform_drivers[su.platform])
    return browser


__platform_drivers = {
    "win": pwd / "geckodriver.exe",
    "darwin": pwd / "geckodriver",
    "linux": pwd / "geckodriver",
}


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
    __platform_drivers,
)


if __name__ == "__main__":
    setup_driver()
