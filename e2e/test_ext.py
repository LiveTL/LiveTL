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
peko_kiara = "https://www.youtube.com/watch?v=c747jYku6Eo"
mio_phas = "https://www.youtube.com/watch?v=h7F4XJh41uo"
phas = "Phasmophobia"


@run_on(all_)
def test_injection(web):
    web.get(chilled_cow)
    time.sleep(5)

    web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])

    # LiveTL Buttons
    @retry
    def _():
        open_button, popout_button, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")

    open_button, popout_button, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")
    assert open_button.text.strip() == "Open LiveTL"
    assert popout_button.text.strip() == "TL Popout"
    assert embed_button.text.strip() == "Embed TLs"

    # Hyperchat Buttons
    hc_button, = web.find_elements_by_css_selector(".toggleButtonContainer")
    assert hc_button.get_attribute("data-tooltip") == "Disable HyperChat"


@run_on(all_)
def test_embed_open(web):
    open_embed(web)
    *_, greeting = web.find_elements_by_css_selector("h2")
    assert greeting.text.strip() == "Welcome to LiveTL!"


@run_on(all_)
def test_embed_resize(web):
    open_embed(web)

    _, embed_window = web.find_elements_by_css_selector(".message-display-wrapper")
    handle, = web.find_elements_by_css_selector(".ui-resizable-handle")

    # Move the embed handlebar down by 20px
    previous_height = embed_window.size["height"]
    ActionChains(web).drag_and_drop_by_offset(handle, 0, 20).perform()
    new_height = embed_window.size["height"]
    assert abs(previous_height - new_height - 20) <= 2, "Moving the handlebar didn't resize the embed frame"

    # Check if the embed resize is persistant
    open_embed(web)
    _, embed_window = web.find_elements_by_css_selector(".message-display-wrapper")
    assert abs(embed_window.size["height"] - new_height) <= 2, "Embed resize is not persistent"


@run_on(all_)
def test_embed_mchad_vod_tls(web):
    open_embed(web, mio_phas)
    switch_to_youtube_parent_frame(web)
    play_video(web)
    wait_for_ads(web, phas)

    # Go to 2/10 completion of the video and back
    body, = web.find_elements_by_css_selector("body")
    with suppress(Exception):
        body.click()
    body.send_keys("2")
    time.sleep(5)
    body.send_keys("0")

    switch_to_embed_frame(web)

    @retry
    def _():
        tl, info = web.find_elements_by_css_selector(".message-display > .message > span")

    tl, info = web.find_elements_by_css_selector(".message-display > .message > span")
    assert "Mio, this time we're veteran" in tl.text, "Incorrect tl"
    assert "MonMon TL" in info.text, "Incorrect author of tl"
    assert "Mchad TL" in info.text, "MCHAD badge not found"
    assert "(00:00:43)" in info.text, "Incorrect tl timestamp"


@run_on(all_)
def test_embed_ytc_vod_tls(web):
    open_embed(web, peko_kiara)
    switch_to_youtube_parent_frame(web)
    play_video(web)
    wait_for_ads(web, "PEKORA")

    # Go to 3/10 completion of video where there is translation of
    # tl: You sound so cool just now
    # author: KFC
    # timestamp: 23:51
    body, = web.find_elements_by_css_selector("body")
    with suppress(Exception):
        body.click()
    body.send_keys("3")
    time.sleep(5)

    switch_to_embed_frame(web)

    @retry
    def _():
        tl, info = web.find_elements_by_css_selector(".message-display > .message > span")

    tl, info = web.find_elements_by_css_selector(".message-display > .message > span")
    assert "You sound so cool just now" in tl.text, "Incorrect tl"
    assert "KFC" in info.text, "Incorrect author"
    assert "Mchad TL" not in info.text, "MCHAD badge incorrectly displayed"
    assert "(23:51)" in info.text, "Incorrect tl timestamp"


def open_embed(web, site=chilled_cow):
    web.get(site)
    time.sleep(5)

    web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])

    @retry
    def _():
        *_, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")

    *_, embed_button = web.find_elements_by_css_selector(".livetlButtonWrapper > span")
    embed_button.click()
    time.sleep(5)

    # switch to embed frame
    web.switch_to.frame(web.find_elements_by_css_selector("iframe")[0])
    close_update_dialogue(web)


def retry(cb, amount=15, interval=1):
    for i in range(amount):
        try:
            return cb()
        except Exception as e:
            if i == amount - 1:
                raise e
            time.sleep(interval)


def wait_for_ads(web, expected_part_of_title):
    # title_el, = web.find_elements_by_css_selector(".ytp-title")
    # while expected_part_of_title not in title_el.text:
    while ">Ad " in web.page_source or [time.sleep(3), ">Ad " in web.page_source][1]:
        for skip in web.find_elements_by_css_selector(".ytp-ad-skip-button"):
            with suppress(Exception):
                skip.click()
                return
        time.sleep(1)


def switch_to_youtube_parent_frame(web):
    while not web.find_elements_by_css_selector("video"):
        web.switch_to.parent_frame()


def switch_to_embed_frame(web):
    switch_to_youtube_parent_frame(web)
    web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])
    web.switch_to.frame(web.find_elements_by_css_selector("iframe")[0])


def play_video(web):
    with suppress(Exception):
        web.find_elements_by_css_selector(".ytp-large-play-button")[0].click()


def close_update_dialogue(web):
    with suppress(Exception):
        web.find_elements_by_css_selector('.s-dialog button.blue')[0].click()
