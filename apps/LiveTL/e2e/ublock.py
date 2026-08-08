from pathlib import Path
import requests

from autoparaselenium import Extension


web_drivers = Path.home() / ".web-drivers"
web_drivers.mkdir(parents=True, exist_ok=True)


class installations:
    class chrome:
        url = "https://github.com/LiveTL/bin/releases/download/v0.1.0/ublock-chrome-1.36.2.zip"
        path = web_drivers / "ublock-chrome-1.36.2.zip"
    class firefox:
        url = "https://github.com/LiveTL/bin/releases/download/v0.1.0/ublock-firefox-1.36.2.xpi"
        path = web_drivers / "ublock-firefox-1.36.2.xpi"


for browser in [installations.chrome, installations.firefox]:
    if not browser.path.exists():
        r = requests.get(browser.url)
        with open(browser.path, "wb+") as fout:
            fout.write(r.content)


ublock = Extension(
    chrome=str(installations.chrome.path),
    firefox=str(installations.firefox.path)
)
