import functools
import time


def web_test(test):
    @functools.wraps(test)
    def inner(self):
        return test(self.__class__.web)

    return inner


def retry_every_interval(times_to_try=5, wait=1):
    def wrapper(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            args = list(args)
            for _ in range(times_to_try - 1):
                try:
                    return func(*args, **kwargs)
                except AssertionError:
                    time.sleep(wait)
            return func(*args, **kwargs)

        return inner

    return wrapper


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
        # Test on ChilledCow
        chilled_cow = "https://www.youtube.com/watch?v=5qap5aO4i9A"
        if web.current_url != chilled_cow:
            web.get(chilled_cow)
        ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
        assert len(ltlbuttons) == 2, "LiveTL buttons not inserted in live"

    @classmethod
    def teardown_class(cls):
        cls.web.quit()
        del cls.web
