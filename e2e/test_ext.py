import time
import os
from contextlib import suppress
from pathlib import Path

from selenium.webdriver.common.action_chains import ActionChains

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

    web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])

    # LiveTL Buttons
    open_button, popout_button, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")
    assert open_button.text.strip() == "Open LiveTL"
    assert popout_button.text.strip() == "TL Popout"
    assert embed_button.text.strip() == "Embed TLs"

    # Hyperchat Buttons
    hc_button, = web.find_elements_by_css_selector(".toggleButtonContainer")
    assert hc_button.get_attribute("data-tooltip") == "Disable HyperChat"


@run_on(all_)
def test_open_embed(web):
    open_embed(web)
    *_, greeting = web.find_elements_by_css_selector("h2")
    assert greeting.text.strip() == "Welcome to LiveTL!"


@run_on(all_)
def test_embed_resize(web):
    open_embed(web)

    _, embed_window = web.find_elements_by_css_selector(".message-display-wrapper")
    handle, = web.find_elements_by_css_selector(".ui-resizable-handle")

    previous_height = embed_window.size["height"]
    ActionChains(web).drag_and_drop_by_offset(handle, 0, 20).perform()
    new_height = embed_window.size["height"]
    assert abs(previous_height - new_height - 20) <= 1e-2


def open_embed(web):
    web.get(chilled_cow)
    time.sleep(5)

    web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])

    *_, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")
    embed_button.click()
    time.sleep(5)

    # switch to embed frame
    web.switch_to.frame(web.find_elements_by_css_selector("iframe")[0])
    close_update_dialogue(web)


def close_update_dialogue(web):
    with suppress(Exception):
        web.find_elements_by_css_selector('.s-dialog button.blue')[0].click()
