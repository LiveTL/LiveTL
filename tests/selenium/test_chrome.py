import os

import chrome
import routines


if not os.environ.get("DISABLE_CHROME"):
    class TestChrome(routines.TestCases):
        browser = chrome
