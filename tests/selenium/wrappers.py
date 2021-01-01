import functools
import os
import time
from threading import Thread

LEVEL = int(os.environ.get("LEVEL", "0"))
RETRIES = int(os.environ.get("RETRIES", "5"))


def web_test(test):
    @functools.wraps(test)
    def inner(self):
        return test(self.__class__.web)

    return inner


def retry_every_interval(times_to_try=RETRIES, wait=1):
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


def level(lev):
    def wrapper(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            if lev >= LEVEL:
                return func(*args, **kwargs)

        return inner

    return wrapper


def cancel_after(timeout=30):
    def wrapper(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            return_value = None
            success = False

            def test_func():
                nonlocal return_value
                try:
                    return_value = func(*args, **kwargs)
                except SystemExit:
                    return

            def parent_thread():
                nonlocal success
                test_run = Thread(target=test_func, daemon=True)
                test_run.start()
                test_run.join(timeout)
                success = not test_run.is_alive()
                raise SystemExit

            t = Thread(target=parent_thread)
            t.start()
            t.join()
            assert success, f"Did not finish within {timeout} seconds"
            return return_value

        return inner

    return wrapper
