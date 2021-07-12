import time
import os
from pathlib import Path

from autoparaselenium import configure, run_on, all_, Extension

dist = Path(__file__).parent / "../dist"

livetl = Extension(
    firefox=str((dist / "LiveTL-Firefox.xpi").resolve()),
    chrome=str((dist / "LiveTL-Chrome.zip").resolve())
)

headed = bool(os.environ.get("HEADED", False))

configure(
    extensions=[livetl],
    headless=not headed,
    selenium_dir=str((Path.home() / ".web-drivers").resolve())
)


chilled_cow = "https://www.youtube.com/watch?v=5qap5aO4i9A"


@run_on(all_)
def test_injection(web):
    web.get(chilled_cow)
    time.sleep(5)

    # LiveTL Buttons
    open_button, popout_button, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")
    assert open_button.text.strip() == "Open LiveTL"
    assert popout_button.text.strip() == "TL Popout"
    assert embed_button.text.strip() == "Embed TLs"

    # Hyperchat Buttons
    ytc_frame, *_ = web.find_elements_by_css_selector("iframe")
    web.switch_to.frame(ytc_frame)
    hc_button = web.find_elements_by_css_selector(".toggleButtonContainer")
    assert hc_button.get_attribute("data-tooltip") == "Enable HyperChat"
