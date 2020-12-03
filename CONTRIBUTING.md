# Contributing

LiveTL is open to contributors but note that we will not be assigning particular tasks to non-maintainers. Due to this,
we may also reject pull requests that cause major conflicts with a maintainer's local repository. Please first discuss
the change you wish to make via Github issue or with someone with the Developer role on
our [Discord](https://discord.gg/uJrV3tmthg) before making a change. With that being said, do not be afraid to make a
pull request as it will likely be accepted provided you have contacted a maintainer beforehand. If you have any ideas
not related to code that could still help LiveTL, do not hesitate to reach out to us on
our [Discord server](https://discord.gg/uJrV3tmthg)!

LiveTL's contributors are bound to the Contributor Covenant Code of Conduct, found in this repository as "
CODE_OF_CONDUCT.md"

If you are looking to help with UI/UX, please note that we do not have a style guide as of yet which means you will have
to essentially "wing it" should you wish to contribute.

## Pull Request Guidelines

1. Only pull requests to the development branch will be honored.
2. Explain what you did and how.
3. If its a new feature, explain what it is.
4. Add a screen shot if applicable.
5. Make sure it works on both Firefox and a Chromium-based browser

## Set up a local development environment

**Refer
to '[Starting up a local development environment](https://github.com/KentoNishi/LiveTL/blob/develop/CONTRIBUTING.md#starting-up-a-local-development-environment)'
if you have already set up a local development environment**

**If you have difficulty setting up this environment, do _not_ open an issue. Message one of the admins or ask for help
on this [Discord server](https://discord.gg/uJrV3tmthg).**

### Prerequisites

- Git ([Windows](https://git-scm.com/download/win) | [MacOS](https://git-scm.com/download/mac)
  | [Linux](https://git-scm.com/download/linux))
- Node.js 10+ ([Windows, MacOS, and Linux](https://nodejs.org/en/download))
- Chromium based browser ([Windows, MacOS, and Linux](https://www.google.com/chrome/))
- Firefox ([Windows, MacOS, and Linux](https://www.mozilla.org/en-US/firefox/new/))

### Setting up the environment

1. Clone this repo (`git clone https://github.com/KentoNishi/LiveTL.git`)
2. Change directory `cd` to the newly created `LiveTL` repo.
3. Switch to the `develop` branch (`git checkout develop`)

   Congratulations, you should now be running a local environment for LiveTL!

## Starting up a local development environment

**Refer
to '[Set up a local development environment](https://github.com/KentoNishi/LiveTL/blob/develop/CONTRIBUTING.md#set-up-a-local-development-environment)'
if you have not yet set up a local development environment with the instructions provided above.**

**If you have difficulty starting up your environments, do _not_ open an issue. Message one of the admins or ask for
help on the [discord server](https://discord.gg/uJrV3tmthg).**

- `make` will build the firefox and chrome extensions
    - The unpacked extension for each browser will be in `build/` and the packed extensions will be in `dist/`
- `make test` will run the available tests
- `make clean` will clear the build
- In firefox, use about:debuggging to load the extension.
- In chromium-based browsers, load an unpacked extension in the extension menu.

## Naming Scheme Conventions

- javascript is camelCased
- folders are hyphen-cased
- test files are cased according to the file that the test runs
- follow the [standard style](https://standardjs.com/rules.html) for javascript

## Directory structure

.\
├── LiveTL - extension\
│ ├── css - css files\
│ ├── icons - icons to use\
│ └── js - the main js files\
│ └── lib - modules that will be concatenated to the main `frame.js` file\
├── about - about github page\
├── build - build files\
│ ├── chrome\
│ │ └── LiveTL - chrome unpacked extension\
│ ├── common - common files to be bundled in both extensions\
│ └── firefox\
│ └── LiveTL - firefox unpacked extension\
├── dist - distribution files\
│ ├── chrome - contains chrome zipped extension\
│ └── firefox - contains firefox zipped extension\
├── embed - embedding chat\
├── img - image files to be shown on github\
└── tests - test files to be run

## Other

- do not assign anything other than string literals to `innerHTML`
- avoid remote code execution

These guidelines are based off the guidelines from [Pogify](https://www.github.com/Pogify/pogify).

## **Thanks for contributing to LiveTL! We can't wait to see what you do with it!**
