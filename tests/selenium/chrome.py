import os
import stat
import subprocess as sb
import sys
from pathlib import Path

import setup_utils as su
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

pwd = Path(".") / "drivers"
platform = su.platform

enable_headless = False


class Popen(sb.Popen):
    """
    Suppress chromedriver output on windows
    """

    def __init__(self, *args, **kwargs):
        if sys.platform[:3] == "win":
            kwargs = {
                "stdin": sb.PIPE,
                "stdout": sb.PIPE,
                "stderr": sb.PIPE,
                "shell": False,
                "creationflags": 0x08000000,
            }
        super().__init__(*args, **kwargs)


class ChromeDriver(webdriver.Chrome):
    def __init__(self, *args, **kwargs):
        old_popen = sb.Popen
        sb.Popen = Popen
        super().__init__(*args, **kwargs)
        sb.Popen = old_popen


def get_selenium(display: bool = False) -> webdriver.Chrome:
    options = __get_options(display)
    browser = ChromeDriver(
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
    options.add_extension("dist/chrome/LiveTL-integration.zip")
    # options.add_extension(str(Path(".").resolve() / "dist" /"chrome" / "LiveTL.zip"))
    if enable_headless:
        # options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
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
    web = get_selenium()
