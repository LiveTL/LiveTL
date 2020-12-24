import sys
import time

from wrappers import level, retry_every_interval, web_test

chilled_cow = "https://www.youtube.com/watch?v=5qap5aO4i9A"
peko_kiara = "https://www.youtube.com/watch?t=926&v=c747jYku6Eo"


class TestCases:
    @classmethod
    def setup_class(cls):
        cls.browser.setup_driver()
        cls.web = cls.browser.get_selenium()
        try:
            cls.web.switch_to.window("1")
        except Exception:
            pass

    @level(0)
    @web_test
    @retry_every_interval()
    def test_live_button_insertion(web):
        go_to_website(web, chilled_cow)
        ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
        assert len(ltlbuttons) == 2, "LiveTL buttons not inserted in live"

    @level(0)
    @web_test
    @retry_every_interval()
    def test_vod_button_insertion(web):
        go_to_website(web, peko_kiara)
        ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
        assert len(ltlbuttons) == 2, "LiveTL buttons not inserted in vod"

    @level(1)
    @web_test
    def test_livetl_panel_layout(web):
        go_to_video_in_livetl(web, chilled_cow)
        iframes = web.find_elements_by_css_selector("iframe")
        assert len(iframes) == 3, "Should have 3 iframes"
        correct_ids = ("stream", "chat", "livetl-chat")
        for frame, idd in zip(iframes, correct_ids):
            assert frame.get_attribute("id") == idd, "incorrect iframe id"
        web.switch_to.frame(iframes[2])
        assert web.find_elements_by_css_selector(
            "#updateInfo"
        ), "livetl-chat hasn't loaded"

    @level(2)
    @web_test
    def test_livetl_window_size_change(web):
        go_to_video_in_livetl(web, chilled_cow)
        iframes = web.find_elements_by_css_selector("iframe")
        iframes_og_sizes = [frame.size for frame in iframes]
        ogx, ogy = web.get_window_size().values()
        web.set_window_size(ogx / 2, ogy / 4)
        time.sleep(1)
        web.set_window_size(ogx, ogy)
        time.sleep(1)
        iframes_new_sizes = [frame.size for frame in iframes]
        assert_msg = (
            "panels changed size on window size change "
            f"{iframes_og_sizes} {iframes_new_sizes}"
        )
        assert all(
            two_window_sizes_are_equal(i, j)
            for i, j in zip(iframes_og_sizes, iframes_new_sizes)
        ), assert_msg

    @classmethod
    def teardown_class(cls):
        cls.web.quit()
        del cls.web


def go_to_website(web, url):
    if web.current_url != url:
        web.get(url)


@retry_every_interval()
def go_to_video_with_buttons(web, url):
    go_to_website(web, chilled_cow)
    ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
    assert len(ltlbuttons) == 2, "LiveTL buttons not inserted in live"


def go_to_video_in_livetl(web, url):
    go_to_video_with_buttons(web, url)
    web.find_elements_by_css_selector(".liveTLBotan")[0].click()


def two_window_sizes_are_equal(first, second):
    first_sizes = tuple(map(int, first.values()))
    second_sizes = tuple(map(int, second.values()))
    return first_sizes == second_sizes
