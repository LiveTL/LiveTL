from wrappers import retry_every_interval, web_test

chilled_cow = "https://www.youtube.com/watch?v=5qap5aO4i9A"
peko_kiara = "https://www.youtube.com/watch?v=c747jYku6Eo&t=926"


class TestCases:
    @classmethod
    def setup_class(cls):
        cls.browser.setup_driver()
        cls.web = cls.browser.get_selenium()
        try:
            cls.web.switch_to.window("1")
        except Exception:
            pass

    @web_test
    @retry_every_interval()
    def test_live_button_insertion(web):
        go_to_website(web, chilled_cow)
        ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
        assert len(ltlbuttons) == 2, "LiveTL buttons not inserted in live"

    @web_test
    @retry_every_interval()
    def test_vod_button_insertion(web):
        go_to_website(web, peko_kiara)
        ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
        assert len(ltlbuttons) == 2, "LiveTL buttons not inserted in vod"

    @web_test
    def test_livetl_panel_layout(web):
        go_to_video_with_buttons(web, chilled_cow)
        buttons = web.find_elements_by_css_selector(".liveTLBotan")
        buttons[0].click()
        iframes = web.find_elements_by_css_selector("iframe")
        assert len(iframes) == 3, "Should have 3 iframes"
        correct_ids = ("stream", "chat", "livetl-chat")
        for frame, idd in zip(iframes, correct_ids):
            assert frame.get_attribute("id") == idd, "incorrect iframe id"
        web.switch_to.frame(iframes[2])
        assert web.find_elements_by_css_selector(
            "#updateInfo"
        ), "livetl-chat hasn't loaded"

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
