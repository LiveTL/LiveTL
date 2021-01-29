py = python3
pip = ${py} -m pip
pytest = ${py} -m pytest
jquery = "./build/common/jquery.min.js"
jquery-ui = "./build/common/jquery-ui.min.js"
jquery-css = "./build/common/jquery-ui.css"
jquery-ui-touch = "./build/common/jquery-ui-touch.css"
sjquery = "./build/static/jquery.min.js"
sjquery-ui = "./build/static/jquery-ui.min.js"
sjquery-css = "./build/static/jquery-ui.css"
sjquery-ui-touch = "./build/static/jquery-ui-touch.css"

lib = "./LiveTL/js/lib"

ifndef EMBED_DOMAIN
EMBED_DOMAIN=https://kentonishi.github.io/LiveTL/embed
endif

ifndef VERSION
VERSION=69.42.0
endif

ifeq ($(shell uname), Darwin)
IS_GSED_INSTALLED := $(shell gsed --version 2>/dev/null)
ifndef IS_GSED_INSTALLED
$(error "gsed not found. You can install it using brew with `brew install gnu-sed`")
endif
sed=gsed
else
sed=sed
endif

replace-embed-domain=${sed} 's|EMBED_DOMAIN|"${EMBED_DOMAIN}"|g'
replace-embed-domain-noquote=${sed} 's|EMBED_DOMAIN|${EMBED_DOMAIN}|g'
replace-version=${sed} 's|VERSION|${VERSION}|g'

all: chrome firefox android

.PHONY: init bench test chrome firefox android clean

# TODO Change to using file subtargets
init:
	mkdir -p dist/
	mkdir -p build/common/
	mkdir -p build/static/
	@cp $(sjquery) $(jquery) || curl -s -o $(sjquery) https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js & \
	cp $(sjquery-ui) $(jquery-ui) || curl -s -o $(sjquery-ui) https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js & \
	cp $(sjquery-css) $(jquery-css) || curl -s -o $(sjquery-css) https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css & \
	cp $(sjquery-ui-touch) $(jquery-ui-touch) || curl -s -o $(sjquery-ui-touch) https://raw.githubusercontent.com/furf/jquery-ui-touch-punch/master/jquery.ui.touch-punch.min.js & \
       	wait
	cp $(sjquery) $(jquery)
	cp $(sjquery-ui) $(jquery-ui)
	cp $(sjquery-css) $(jquery-css)
	cp $(sjquery-ui-touch) $(jquery-ui-touch)

testinit:
	cat requirements.txt | grep "#" | $(sed) 's/#//g' | $(py) || $(pip) install -r requirements.txt

test: firefox chrome testinit
	@node tests/*.js
	@$(pytest) tests/selenium

bench:
	@node bench/*.js

chrome: common
	rm -rf dist/chrome/
	mkdir -p dist/chrome/
	mkdir -p build/chrome/LiveTL/
	rsync -a LiveTL build/chrome/ --exclude LiveTL/submodules/chat/
	rsync -a LiveTL/submodules/chat/dist/ build/chrome/LiveTL/hyperchat
	cp $(jquery) ./build/chrome/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/chrome/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/chrome/LiveTL/css/jquery-ui.css
	cp $(jquery-ui-touch) ./build/chrome/LiveTL/jquery-ui-touch.js
	cp ./build/common/frame.js ./build/chrome/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/chrome/LiveTL/js/index.js
	cp ./build/common/background.js ./build/chrome/LiveTL/js/background.js
	cp ./build/common/chat.js ./build/chrome/LiveTL/js/chat.js
	rm -rf ./build/chrome/LiveTL/js/lib
	rm -rf ./build/chrome/LiveTL/submodules/
	grep -v all_urls ./build/common/manifest.json > ./build/chrome/LiveTL/manifest.json
	cp ./LICENSE ./build/chrome/LiveTL/
	cd build/chrome/ && zip -9r ../../dist/chrome/LiveTL.zip LiveTL/
	cd build/chrome/LiveTL && zip -9r ../../../dist/chrome/LiveTL-integration.zip *

firefox: common
	rm -rf dist/firefox/
	mkdir -p dist/firefox/
	mkdir -p build/firefox/
	rsync -a LiveTL build/firefox/ --exclude LiveTL/submodules/chat/
	rsync -a LiveTL/submodules/chat/dist/ build/firefox/LiveTL/hyperchat
	cp $(jquery) ./build/firefox/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/firefox/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/firefox/LiveTL/css/jquery-ui.css
	cp $(jquery-ui-touch) ./build/firefox/LiveTL/jquery-ui-touch.js
	cp ./build/common/frame.js ./build/firefox/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/firefox/LiveTL/js/index.js
	cp ./build/common/background.js ./build/firefox/LiveTL/js/background.js
	cp ./build/common/chat.js ./build/firefox/LiveTL/js/chat.js
	rm -rf ./build/firefox/LiveTL/js/lib/
	rm -rf ./build/firefox/LiveTL/submodules/
	cp ./LICENSE ./build/firefox/LiveTL/
	grep -v incognito ./build/common/manifest.json > ./build/firefox/LiveTL/manifest.json
	cd build/firefox/LiveTL && zip -9r ../../../dist/firefox/LiveTL.zip *
	cp dist/firefox/LiveTL.zip dist/firefox/LiveTL.xpi
	zip -d dist/firefox/LiveTL.xpi "css/"
	zip -d dist/firefox/LiveTL.xpi "icons/"
	zip -d dist/firefox/LiveTL.xpi "popout/"
	zip -d dist/firefox/LiveTL.xpi "js/"

safari: common
	rm -rf dist/safari/
	mkdir -p dist/safari/
	mkdir -p build/safari/
	rsync -a LiveTL build/safari/ --exclude LiveTL/submodules/chat/
	rsync -a LiveTL/submodules/chat/dist/ build/safari/LiveTL/hyperchat
	cp $(jquery) ./build/safari/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/safari/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/safari/LiveTL/css/jquery-ui.css
	cp $(jquery-ui-touch) ./build/safari/LiveTL/jquery-ui-touch.js
	cp ./build/common/frame.js ./build/safari/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/safari/LiveTL/js/index.js
	cp ./build/common/background.js ./build/safari/LiveTL/js/background.js
	cp ./build/common/chat.js ./build/safari/LiveTL/js/chat.js
	rm -rf ./build/safari/LiveTL/js/lib/
	rm -rf ./build/safari/LiveTL/submodules/
	cp ./LICENSE ./build/safari/LiveTL/
	grep -v incognito ./build/common/manifest.json > ./build/safari/LiveTL/manifest.json
	mkdir dist/safari/tmp/
	xcodebuild -project LiveTL-Safari/LiveTL/LiveTL.xcodeproj CONFIGURATION_BUILD_DIR=../../dist/safari/tmp/
	cp -r dist/safari/tmp/LiveTL.app dist/safari/LiveTL.app
	rm -r dist/safari/tmp/
	rm -r LiveTL-Safari/LiveTL/build/

safari-noBuild: common
	rm -rf dist/safari/
	mkdir -p dist/safari/
	mkdir -p build/safari/
	rsync -a LiveTL build/safari/ --exclude LiveTL/submodules/chat/
	rsync -a LiveTL/submodules/chat/dist/ build/safari/LiveTL/hyperchat
	cp $(jquery) ./build/safari/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/safari/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/safari/LiveTL/css/jquery-ui.css
	cp $(jquery-ui-touch) ./build/safari/LiveTL/jquery-ui-touch.js
	cp ./build/common/frame.js ./build/safari/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/safari/LiveTL/js/index.js
	cp ./build/common/background.js ./build/safari/LiveTL/js/background.js
	cp ./build/common/chat.js ./build/safari/LiveTL/js/chat.js
	rm -rf ./build/safari/LiveTL/js/lib/
	rm -rf ./build/safari/LiveTL/submodules/
	cp ./LICENSE ./build/safari/LiveTL/
	grep -v incognito ./build/common/manifest.json > ./build/safari/LiveTL/manifest.json

android: chrome
	mkdir -p LiveTL-Android/app/src/main/assets/
	cp -r build/chrome/LiveTL/* LiveTL-Android/app/src/main/assets/
	cp LiveTL/js/lib/inject.js LiveTL-Android/app/src/main/assets/
	cp ./build/common/chat.js LiveTL-Android/app/src/main/assets/

android-release: android
	echo "import requests" | $(py) || $(pip) install requests
	VERSION=$(VERSION) $(py) scripts/update_gradle_versions.py

common: init
	cat $(lib)/constants.js $(lib)/../frame.js $(lib)/storage.js $(lib)/filter.js $(lib)/settings.js $(lib)/speech.js \
	       	$(lib)/translator-mode.js $(lib)/marine.js $(lib)/css.js $(lib)/svgs.js \
		| $(sed) 'H;1h;$$!d;x;s/import {[^}]*} from//g; N' \
		| $(sed) 'H;1h;$$!d;x;s/module\.exports \= {[^}]*}//g; N' \
		| $(replace-embed-domain) \
		> ./build/common/frame.js
	$(replace-embed-domain) $(lib)/../index.js > ./build/common/index.js
	$(replace-embed-domain-noquote) LiveTL/manifest.json | $(replace-version) > ./build/common/manifest.json
	$(replace-embed-domain-noquote) LiveTL/js/background.js > ./build/common/background.js
	cp LiveTL/submodules/chat/scripts/chat.js ./build/common/chat.js
	$(sed) -i "1s/.*/window\.isLiveTL = true;/" ./build/common/chat.js;
	cd LiveTL/submodules/chat/ && npm install && npm run publish
  
clean:
	rm -rf dist/
	rm -rf build/
	rm -rf drivers/
	rm -rf LiveTL-Android/app/src/main/assets/*
