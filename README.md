# LiveTL - Translation Filter for Streams

![Latest Release Build](https://github.com/LiveTL/LiveTL/workflows/Latest%20Release%20Build/badge.svg)
![Tests](https://github.com/LiveTL/LiveTL/workflows/Tests/badge.svg)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/standard/semistandard)
[![Bundler: samepack](https://img.shields.io/badge/bundler-samepack-brightgreen)](https://github.com/r2dev2/samepack)
[![Contributors](https://img.shields.io/github/contributors/LiveTL/LiveTL)](https://github.com/LiveTL/LiveTL/contributors)
[![Issues](https://img.shields.io/github/issues/LiveTL/LiveTL)](https://github.com/LiveTL/LiveTL/issues)
![Total Lines](https://img.shields.io/tokei/lines/github/LiveTL/LiveTL)
![Size](https://img.shields.io/github/repo-size/LiveTL/LiveTL)
[![Commit Activity](https://img.shields.io/github/commit-activity/w/LiveTL/LiveTL)](https://github.com/LiveTL/LiveTL/commits/)
[![Discord](https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uJrV3tmthg)

Get live translations for YouTube streams, crowdsourced from multilingual viewers!

### [Download LiveTL](https://livetl.github.io/LiveTL/)

![Demo](./img/cover-android.png)

## Feedback and Contributing

We have a Discord server for those who would like to give feedback or discuss new
features! [Here is the invite](https://discord.gg/uJrV3tmthg).

If you are interested in helping us solve any issues and/or add features, please let us know in the Discord server and
submit a Pull Request!

## Usage

To build from scratch, execute the following commands in a bash terminal. The resulting extension zip file will be in
dist/. The unpacked extension will be in build/

```bash
git clone https://github.com/LiveTL/LiveTL.git --recursive
# you must clone recursively because the repository uses submodules
cd LiveTL/
make
```

### ⚠ Build Dependencies ⚠
- rsync
- npm (Note that the version installed by apt on Ubuntu 18.04 is too old and will not work, you'll have to upgrade npm manually)
- gnu-sed (MacOS -- `brew install gsed` will install GNU-SED if you have `brew` installed)
- python >= 3.6

## Developers

LiveTL is developed by [these fine people](https://github.com/LiveTL/LiveTL/graphs/contributors).
