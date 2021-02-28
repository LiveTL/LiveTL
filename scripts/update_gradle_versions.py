import os
import re
from pathlib import Path

import requests

new_gradle = []

build_gradle = Path(".") / "LiveTL-Android/app/build.gradle"

releases = 0
listed_releases = [0]
page = 1
while listed_releases:
    listed_releases = requests.get(
        "https://api.github.com/repos/LiveTL/LiveTL/releases",
        params={"per_page": 100, "page": page},
    ).json()
    releases += len(listed_releases)
    page += 1


with open(build_gradle, "r") as fin:
    for line in fin:
        if "versionCode" in line:
            version_code = releases - 31
            new_line = re.sub(r"\d+", f"{version_code}", line)
        elif "versionName" in line:
            version_name = re.sub(r"\"", "", os.environ["VERSION"])
            new_line = re.sub(r"[\d\.]+", version_name, line)
        else:
            new_line = line
        new_gradle.append(new_line)

with open(build_gradle, "w+") as fout:
    print(*new_gradle, sep="", end="", file=fout)
