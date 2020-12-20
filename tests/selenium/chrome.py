import os
import stat
from pathlib import Path

import setup_utils as su

pwd = Path(".") / "drivers"
platform = su.platform

def setup_driver() -> None:
    __setup_driver()
    os.chmod(pwd / "chromedriver", stat.S_IEXEC)

__setup_driver = su.setup_driver(
    {
        "win": [
            "https://chromedriver.storage.googleapis.com"
            "/88.0.4324.27/chromedriver_win32.zip",
            su.unzip,
        ],
        "darwin": [
            "https://chromedriver.storage.googleapis.com"
            "/88.0.4324.27/chromedriver_mac64.zip",
            su.untar,
        ],
        "linux": [
            "https://chromedriver.storage.googleapis.com/"
            "88.0.4324.27/chromedriver_linux64.zip",
            su.unzip,
        ],
    },
    {
        "win": pwd / "chromedriver.exe",
        "darwin": pwd / "chromedriver",
        "linux": pwd / "chromedriver",
    },
)


if __name__ == "__main__":
    setup_driver()
