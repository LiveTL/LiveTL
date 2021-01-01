import requests
from pathlib import Path
import os
import re

new_gradle = []

build_gradle = Path('.') / "LiveTL-Android/app/build.gradle"

releases = len(requests.get("https://api.github.com/repos/KentoNishi/LiveTL/releases").json())

with open(build_gradle, 'r') as fin:
    for line in fin:
        if "versionCode" in line:
            version_code = releases - 28
            new_line = re.sub(r"\d+", f"{version_code}", line)
        elif "versionName" in line:
            version_name = re.sub(r"\"", "", os.environ["VERSION"])
            new_line = re.sub(r"[\d\.]+", version_name, line)
        else:
            new_line = line
        new_gradle.append(new_line)

with open(build_gradle, 'w+') as fout:
    print(*new_gradle, sep='', end='', file=fout)

