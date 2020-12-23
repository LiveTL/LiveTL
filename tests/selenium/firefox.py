from pathlib import Path

import setup_utils as su
from selenium import webdriver

pwd = Path(".") / "drivers"


class FirefoxDriver(webdriver.Firefox):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.has_quit = False

    def quit(self):
        if not self.has_quit:
            self.has_quit = True
            super().quit()

    def __del__(self):
        self.quit()


def setup_driver() -> None:
    __setup_driver()


# FIXME display option doesn't do anything right now
def get_selenium(display: bool = False) -> webdriver.Firefox:
    fp = webdriver.FirefoxProfile()
    fp.DEFAULT_PREFERENCES["frozen"]["xpinstall.signatures.required"] = False
    options = webdriver.FirefoxOptions()
    options.headless = not display
    browser = FirefoxDriver(
        executable_path=__platform_drivers[su.platform],
        firefox_profile=fp,
        options=options,
    )
    browser.install_addon(
        str(Path(".").resolve() / "dist" / "firefox" / "LiveTL.xpi"), True
    )
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
    web = get_selenium()
