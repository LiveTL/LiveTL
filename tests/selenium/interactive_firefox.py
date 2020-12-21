import firefox


def main(browser):
    browser.setup_driver()
    web = browser.get_selenium(True)
    try:
        web.switch_to.window("1")
    except Exception:
        pass
    web.get("https://www.youtube.com/watch?v=5qap5aO4i9A")
    ltlbuttons = web.find_elements_by_css_selector(".liveTLBotan")
    return web


if __name__ == "__main__":
    web = main(firefox)
