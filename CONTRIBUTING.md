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
to '[Starting up a local development environment](https://github.com/LiveTL/LiveTL/blob/develop/CONTRIBUTING.md#starting-up-a-local-development-environment)'
if you have already set up a local development environment**

**If you have difficulty setting up this environment, do _not_ open an issue. Message one of the admins or ask for help
on this [Discord server](https://discord.gg/uJrV3tmthg).**

### Prerequisites

- Git ([Windows](https://git-scm.com/download/win) | [MacOS](https://git-scm.com/download/mac)
  | [Linux](https://git-scm.com/download/linux))
- Node.js 10+ ([Windows, MacOS, and Linux](https://nodejs.org/en/download))
- Chrome ([Windows, MacOS, and Linux](https://www.google.com/chrome/))
- Firefox ([Windows, MacOS, and Linux](https://www.mozilla.org/en-US/firefox/new/))

### Setting up the environment

1. Clone this repo (`git clone https://github.com/LiveTL/LiveTL.git`)
2. Change directory `cd` to the newly created `LiveTL` repo.
3. Switch to the `develop` branch (`git checkout develop`)

   Congratulations, you should now be running a local environment for LiveTL!

## Starting up a local development environment

**Refer
to '[Set up a local development environment](https://github.com/LiveTL/LiveTL/blob/develop/CONTRIBUTING.md#set-up-a-local-development-environment)'
if you have not yet set up a local development environment with the instructions provided above.**

**If you have difficulty starting up your environments, do _not_ open an issue. Message one of the admins or ask for
help on the [discord server](https://discord.gg/uJrV3tmthg).**

- `yarn start` will start the development server in hmr mode
- `yarn test:watch` will run the tests in watch mode
- `make clean` will clear the build
- In firefox, use about:debuggging to load the extension.
- In chromium-based browsers, load an unpacked extension in the extension menu.

## Naming Scheme Conventions

- javascript is camelCased
- folders are hyphen-cased
- test files are cased according to the file that the test runs
- follow the [semistandard style](https://github.com/standard/semistandard) for javascript
- use [black](https://github.com/psf/black) and [isort](https://github.com/pycqa/isort/) for python

## Directory structure

.\
├── build - build files that get hot reloaded\
├── dist - two zips, one for firefox and one for chrome\
├── e2e - python selenium tests\
├── img - images used in LiveTL README and docs\
├── src\
│   ├── changelogs - changelog components\
│   │   ├── common\
│   │   └── img\
│   ├── components - general svelte components, mostly flat component directory structure\
│   │   ├── options - svelte components that are types of options to be composed in settings\
│   │   └── settings - each settings page\
│   ├── css - pretty much nothing lmao\
│   ├── img - images available in the extension\
│   ├── js - all our modules\
│   │   ├── content_scripts - has the injector script that injects the LiveTL buttons\
│   │   ├── pages - the exports of the svelte components that represent each LiveTL page\
│   │   └── polyfills - polyfills we use\
│   ├── plugins - plugins for injection to our script\
│   ├── submodules - submodules\
│   │   └── chat - the chat optimizer of [Hyperchat](https://www.github.com/LiveTL/HyperChat)\
│   └── __tests__ - tests that match the directory structure of `src`\
├── theme - theming for svelte-materialify\
└── utils - utility scripts for yarn commands

## Other

- do not assign anything other than string literals to `innerHTML`
- avoid remote code execution

These guidelines are based off the guidelines from [Pogify](https://www.github.com/Pogify/pogify).

## **Thanks for contributing to LiveTL! We can't wait to see what you do with it!**
