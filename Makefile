jquery = "./build/common/jquery.min.js"
jquery-ui = "./build/common/jquery-ui.min.js"
jquery-css = "./build/common/jquery-ui.css"
lib = "./LiveTL/js/lib"

ifndef EMBED_DOMAIN
EMBED_DOMAIN=http://localhost:8000/embed
endif

ifndef VERSION
VERSION=0.1.0
endif

replace-embed-domain=sed 's|EMBED_DOMAIN|"$(EMBED_DOMAIN)"|g'
replace-embed-domain-noquote=sed 's|EMBED_DOMAIN|$(EMBED_DOMAIN)|g'
replace-version=sed 's|VERSION|$(VERSION)|g'

all: chrome firefox

.PHONY: init bench test chrome firefox clean

init:
	mkdir -p dist/
	mkdir -p build/common/
	curl -s -o $(jquery) https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js & \
	curl -s -o $(jquery-ui) https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js & \
	curl -s -o $(jquery-css) https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css & \
       	wait

test:
	node tests/*.js

bench:
	node bench/*.js

chrome: common
	rm -rf dist/chrome/
	mkdir -p dist/chrome/
	mkdir -p build/chrome/LiveTL/
	cp -r LiveTL/ build/chrome/
	cp $(jquery) ./build/chrome/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/chrome/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/chrome/LiveTL/css/jquery-ui.css
	cp ./build/common/frame.js ./build/chrome/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/chrome/LiveTL/js/index.js
	rm -rf ./build/chrome/LiveTL/js/lib
	cp ./build/common/manifest.json ./build/chrome/LiveTL/manifest.json
	cp ./LICENSE ./build/chrome/LiveTL/
	cd build/chrome/ && zip -9r ../../dist/chrome/LiveTL.zip LiveTL/

firefox: common
	rm -rf dist/firefox/
	mkdir -p dist/firefox/
	mkdir -p build/firefox/
	cp -r LiveTL build/firefox/
	cp $(jquery) ./build/firefox/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/firefox/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/firefox/LiveTL/css/jquery-ui.css
	cp ./build/common/frame.js ./build/firefox/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/firefox/LiveTL/js/index.js
	rm -rf ./build/firefox/LiveTL/js/lib/
	cp ./LICENSE ./build/firefox/LiveTL/
	grep -v incognito ./build/common/manifest.json > ./build/firefox/LiveTL/manifest.json
	cd build/firefox/LiveTL && zip -9r ../../../dist/firefox/LiveTL.zip *
	
safari: common 
	rm -rf dist/safari/
	mkdir -p dist/safari/
	mkdir -p build/safari/
	cp -r LiveTL build/safari/
	cp $(jquery) ./build/safari/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/safari/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/safari/LiveTL/css/jquery-ui.css
	cp ./build/common/frame.js ./build/safari/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/safari/LiveTL/js/index.js
	rm -rf ./build/safari/LiveTL/js/lib/
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
	cp -r LiveTL build/safari/
	cp $(jquery) ./build/safari/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/safari/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/safari/LiveTL/css/jquery-ui.css
	cp ./build/common/frame.js ./build/safari/LiveTL/js/frame.js
	cp ./build/common/index.js ./build/safari/LiveTL/js/index.js
	rm -rf ./build/safari/LiveTL/js/lib/
	cp ./LICENSE ./build/safari/LiveTL/
	grep -v incognito ./build/common/manifest.json > ./build/safari/LiveTL/manifest.json

common: init
	cat $(lib)/constants.js $(lib)/../frame.js $(lib)/storage.js $(lib)/filter.js $(lib)/svgs.js \
		| grep -v module.export | $(replace-embed-domain) \
		> ./build/common/frame.js
	$(replace-embed-domain) $(lib)/../index.js > ./build/common/index.js
	$(replace-embed-domain-noquote) LiveTL/manifest.json | $(replace-version) > ./build/common/manifest.json

clean:
	rm -rf dist/
	rm -rf build/
