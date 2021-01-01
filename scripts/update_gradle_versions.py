from pathlib import Path
import os
import re

new_gradle = []

build_gradle = Path('.') / "LiveTL-Android/app/build.gradle"

with open(build_gradle, 'r') as fin:
    for line in fin:
        if "versionCode" in line:
            version_code = int(re.search(r"(\d+)", line).group(1))
            new_line = re.sub(r"\d+", f"{version_code + 1}", line)
        elif "versionName" in line:
            version_name = re.sub(r"\"", "", os.environ["VERSION"])
            new_line = re.sub(r"[\d\.]+", version_name, line)
        else:
            new_line = line
        new_gradle.append(new_line)

with open(build_gradle, 'w+') as fout:
    print(*new_gradle, sep='', end='', file=fout)

