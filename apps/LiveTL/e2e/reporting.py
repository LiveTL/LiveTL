import os

import requests

url = os.environ.get("DISCORD_REPORT_HOOK", "").strip()

def report_file(test_name, browser_name, filename):
    if not url:
        return
    with open(filename, "rb") as fin:
        requests.post(
            url,
            data={
                "content": f"`{test_name}` in `{browser_name}` failed :("
            },
            files={
                "file": fin
            }
        )


# report_file("test_kentos_virginity", "edge", "bug.png")
