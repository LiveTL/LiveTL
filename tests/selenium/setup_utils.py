import tarfile
from pathlib import Path
from zipfile import ZipFile

import requests


def download(url: str, location: Path) -> None:
    __touch(location)
    r = requests.get(url)
    r.raise_for_status()
    with open(location, "wb+") as fout:
        fout.write(r.content)


def unzip(source: str, dest_folder: str) -> None:
    with ZipFile(source, "r") as zip_ref:
        zip_ref.extractall(dest_folder)


def untar(source: str, dest_folder: str) -> None:
    with tarfile.open(source) as tar_ref:
        tar_ref.extractall(dest_folder)


def __touch(location: Path) -> None:
    location.parent.mkdir(parents=True, exist_ok=True)
    location.touch()
