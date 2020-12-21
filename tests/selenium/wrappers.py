import functools
import os
import time

LEVEL = int(os.environ.get("LEVEL", "0"))

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


def level(lev):
    def wrapper(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            if lev >= LEVEL:
                return func(*args, **kwargs)
        return inner
    return wrapper
