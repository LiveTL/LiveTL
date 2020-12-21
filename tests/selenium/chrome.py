import os
import stat
from pathlib import Path

import setup_utils as su
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

pwd = Path(".") / "drivers"
platform = su.platform

enable_headless = False


def get_selenium(display: bool = False) -> webdriver.Chrome:
    options = __get_options(display)
    browser = webdriver.Chrome(
        executable_path=__platform_drivers[su.platform], options=options
    )
    return browser


def setup_driver() -> None:
    __setup_driver()
    if (pwd / "chromedriver").exists():
        os.chmod(pwd / "chromedriver", stat.S_IEXEC)


# FIXME --headless results in bugs
def __get_options(display: bool) -> Options:
    options = Options()
    options.add_extension(r"dist\chrome\LiveTL-integration.zip")
    if enable_headless:
        options.add_argument("--disable-gpu")
        if not display:
            options.add_argument("--headless")
    return options


__platform_drivers = {
    "win": pwd / "chromedriver.exe",
    "darwin": pwd / "chromedriver",
    "linux": pwd / "chromedriver",
}

# 88.0.4324.27 in beta
version = "87.0.4280.88"

__setup_driver = su.setup_driver(
    {
        "win": [
            "https://chromedriver.storage.googleapis.com"
            f"/{version}/"
            "chromedriver_win32.zip",
            su.unzip,
        ],
        "darwin": [
            "https://chromedriver.storage.googleapis.com"
            f"/{version}/"
            "chromedriver_mac64.zip",
            su.untar,
        ],
        "linux": [
            "https://chromedriver.storage.googleapis.com"
            f"/{version}/"
            "chromedriver_linux64.zip",
            su.unzip,
        ],
    },
    __platform_drivers,
)


if __name__ == "__main__":
    setup_driver()
    get_selenium()
    input("Press enter to exit")
