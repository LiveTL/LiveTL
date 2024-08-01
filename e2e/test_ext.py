"""
End to end tests.

Screenshots of test failures can be viewed at https://fileupload.r2dev2bb8.repl.co/
"""

import os
import time
from contextlib import suppress
from functools import partial, wraps
from pathlib import Path

import requests
from autoparaselenium import Extension, all_, chrome, configure, firefox
from autoparaselenium import run_on as a_run_on
from reporting import report_file
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from ublock import ublock

dist = Path(__file__).parent / "../dist"

livetl = Extension(
    firefox=str((dist / "LiveTL-Firefox.xpi").resolve()),
    chrome=str((dist / "LiveTL-Chrome.zip").resolve()),
)

headed = bool(os.environ.get("HEADED", False))

configure(
    extensions=[livetl, ublock],
    headless=not headed,
    selenium_dir=str((Path.home() / ".web-drivers").resolve()),
)


chilled_cow = "https://www.youtube.com/watch?v=jfKfPfyJRdk"
peko_kiara = "https://www.youtube.com/watch?v=c747jYku6Eo"
mio_phas = "https://www.youtube.com/watch?v=h7F4XJh41uo"
mio_2 = "https://www.youtube.com/watch?v=4I2iZahIDNg"
phas = "Phasmophobia"


def run_on(*args):
    def wrapper(func):
        @a_run_on(*args)
        @wraps(func)
        def inner(web):
            # need to set a window size or selenium doesn't click some elements
            web.set_window_size(1280, 900)

            # need to switch away from the Welcome to LiveTL tab
            # or else focus isn't given to the tab we are on
            for tab in [*web.window_handles]:
                web.switch_to.window(tab)
                if web.title == "Welcome to LiveTL!":
                    web.close()
            web.switch_to.window(web.window_handles[0])

            query_selector = partial(web.find_element, By.CSS_SELECTOR)
            query_selector_all = partial(web.find_elements, By.CSS_SELECTOR)
            setattr(web, "find_element_by_css_selector", query_selector)
            setattr(web, "find_elements_by_css_selector", query_selector_all)
            try:
                return func(web)
            except Exception as e:
                screenshot = f"failure-{func.__name__}-{browser_str(web)}.png"
                web.save_screenshot(screenshot)
                report_file(func.__name__, browser_str(web), screenshot)
                raise e

        return inner

    return wrapper


@run_on(chrome)
def test_injection(web):
    web.get(chilled_cow)

    @retry
    def _():
        web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])

    # LiveTL Buttons
    @retry
    def _():
        open_button, popout_button, embed_button, hide_button = (
            web.find_elements_by_css_selector("#ltl-wrapper > button")
        )

    open_button, popout_button, embed_button, hide_button = (
        web.find_elements_by_css_selector("#ltl-wrapper > button")
    )
    assert open_button.text.strip() == "Open LiveTL"
    assert popout_button.text.strip() == "TL Popout"
    assert embed_button.text.strip() == "Embed TLs"

    # Hyperchat Buttons
    hc_button, _hc_settings_button = web.find_elements_by_css_selector(
        "#hc-buttons > div"
    )
    assert hc_button.get_attribute("data-tooltip") == "Disable HyperChat"


@run_on(all_)
def test_embed_open(web):
    open_embed(web)
    greetings = [e.text.strip() for e in web.find_elements_by_css_selector("h5")]
    assert "Welcome to LiveTL!" in greetings


@run_on(all_)
def test_embed_resize(web):
    open_embed(web)

    embed_window = web.find_element_by_css_selector(".message-display-wrapper")
    (handle,) = web.find_elements_by_css_selector(".ui-resizable-handle")

    # Move the embed handlebar down by 20px
    previous_height = embed_window.size["height"]
    ActionChains(web).drag_and_drop_by_offset(handle, 0, 20).perform()

    # Check if the window actually changed in size
    new_height = embed_window.size["height"]
    assert (
        abs(previous_height - new_height - 20) <= 2
    ), "Moving the handlebar didn't resize the embed frame"

    # Check if the embed resize is persistant
    open_embed(web)
    embed_window = web.find_element_by_css_selector(".message-display-wrapper")
    assert (
        abs(embed_window.size["height"] - new_height) <= 5
    ), "Embed resize is not persistent"


@run_on(all_)
def test_embed_tldex_vod_tls(web):
    open_mio_embed(web)

    # Skipping from 0 to a later timestamp should show first translation in between
    seek(web, 17 * 60 + 50)
    switch_to_embed_frame(web)

    @retry
    def _():
        tl = web.find_element_by_css_selector(
            ".message-display > .message .message-content"
        )
        info = web.find_element_by_css_selector(
            ".message-display > .message .message-info"
        )

    tl = web.find_element_by_css_selector(
        ".message-display > .message .message-content"
    )
    info = web.find_element_by_css_selector(".message-display > .message .message-info")
    assert "Mio: Ah...." in tl.text, "Incorrect tl"
    assert "Taishi" in info.text, "Incorrect author of tl"
    assert "TLdex" in info.text, "TLdex badge not found"
    assert "(02:05)" in info.text, "Incorrect tl timestamp"


@run_on(all_)
def test_embed_ytc_vod_tls(web):
    open_embed(web, peko_kiara)
    switch_to_youtube_parent_frame(web)
    play_video(web)
    wait_for_ads(web, "PEKORA")

    # Go to 3/10 completion of video where there is translation of
    # tl: to me, just being beside peko makes me happy
    # author: Yami Chan
    # timestamp: 24:09
    seek(web, 24 * 60 + 7)
    switch_to_embed_frame(web)

    @retry
    def _():
        tl = web.find_element_by_css_selector(
            ".message-display > .message .message-content"
        )
        info = web.find_element_by_css_selector(
            ".message-display > .message .message-info"
        )

    tl = web.find_element_by_css_selector(
        ".message-display > .message .message-content"
    )
    info = web.find_element_by_css_selector(".message-display > .message .message-info")
    assert "just being beside peko makes me happy" in tl.text, "Incorrect tl"
    assert "Yami Chan" in info.text, "Incorrect author"
    assert "TLdex" not in info.text, "TLdex badge incorrectly displayed"
    assert "(24:09)" in info.text, "Incorrect tl timestamp"


@run_on(all_)
def test_embed_tl_scroll(web):
    open_mio_embed(web)

    # Make sure the scroll to bottom button isn't already there
    scroll_to_bottom_buttons = lambda web=web: web.find_elements_by_css_selector(
        ".recent-button button"
    )
    switch_to_embed_frame(web)
    assert not scroll_to_bottom_buttons(), "scroll to bottom button is displayed"

    # Load ~9 translations
    seek(web, 0)
    amount_of_tls = 0
    new_tls = 0
    for minutes in range(0, 41, 10):
        seek(web, minutes * 60 + 50)
        new_tls += has_been_new_tl(web, amount_of_tls, amount=30)
        amount_of_tls = get_amount_of_tls(web)

    assert new_tls >= 3, "There were not new translations enough times"
    assert amount_of_tls >= 4, "There were not enough translations caught"

    # Scroll to the top
    switch_to_embed_frame(web)

    @retry
    def _():
        web.execute_script(
            "document.querySelector('.message-display-wrapper .message').scrollIntoView()"
        )
        assert scroll_to_bottom_buttons(), "scroll to bottom button isn't displayed"

    scroll_to_bottom_buttons()[0].click()
    time.sleep(1)  # button doesn't immediately go away
    assert retry_bool(
        lambda: not scroll_to_bottom_buttons()
    ), "scroll to bottom button is still displayed"


def open_mio_embed(web):
    open_embed(web, mio_2)
    switch_to_youtube_parent_frame(web)
    play_video(web)
    wait_for_ads(web, phas)


def get_amount_of_tls(web):
    switch_to_embed_frame(web)
    return len(web.find_elements_by_css_selector(".message-display > .message"))


def has_been_new_tl(web, previous_amount, amount=5, interval=1):
    beg = time.time()
    res = retry_bool(lambda: get_amount_of_tls(web) > previous_amount, amount, interval)
    if not res:
        assert (
            time.time() - beg > amount * interval - 5
        ), "it didn't retry, error with test"
        print(time.time() - beg)
    return res


def browser_str(driver):
    if isinstance(driver, webdriver.Chrome):
        return "chrome"
    if isinstance(driver, webdriver.Firefox):
        return "firefox"
    return "unknown"


def open_embed(web, site=chilled_cow):
    web.get(site)

    @retry
    def _():
        web.switch_to.frame(web.find_elements_by_css_selector("#chatframe")[0])

    @retry
    def _():
        *_, embed_button, hide_button = web.find_elements_by_css_selector(
            "#ltl-wrapper > button"
        )
        assert "Embed" in embed_button.text.strip()

    *_, embed_button, hide_button = web.find_elements_by_css_selector(
        "#ltl-wrapper > button"
    )
    embed_button.click()
    time.sleep(5)

    # switch to embed frame
    web.switch_to.frame(web.find_elements_by_css_selector("iframe")[0])
    close_update_dialogue(web)


def retry(cb, amount=30, interval=1):
    for i in range(amount):
        try:
            return cb()
        except Exception as e:
            if i == amount - 1:
                raise e
            time.sleep(interval)


def retry_bool(cb, amount=30, interval=1):
    for _ in range(amount):
        if cb():
            return True
        time.sleep(interval)
    return False


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
        web.find_elements_by_css_selector(".update-dialog button")[0].click()


def seek(web, seconds):
    switch_to_youtube_parent_frame(web)
    web.execute_script(f"document.querySelector('video').currentTime = {int(seconds)}")


def send_file(filename):
    with open(filename, "rb") as fin:
        requests.post(
            f"https://FileUpload.r2dev2bb8.repl.co/upload/{filename}",
            files={"file": fin},
        )
