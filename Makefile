jquery = "./build/common/jquery.min.js"
jquery-ui = "./build/common/jquery-ui.min.js"
jquery-css = "./build/common/jquery-ui.css"

all: chrome firefox

.PHONY: init chrome firefox clean

init:
	mkdir -p dist/
	mkdir -p build/common/
	curl -s -o $(jquery) https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js & \
	curl -s -o $(jquery-ui) https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js & \
	curl -s -o $(jquery-css) https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css & \
       	wait

test:
	node LiveTL/*_test.js

chrome: init
	rm -rf dist/chrome/
	mkdir dist/chrome/
	mkdir -p build/chrome/LiveTL/
	cp -r LiveTL/ build/chrome/
	cp $(jquery) ./build/chrome/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/chrome/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/chrome/LiveTL/jquery-ui.css
	cat LiveTL/filter.js LiveTL/frame.js > ./build/chrome/LiveTL/frame.js
	rm ./build/chrome/LiveTL/filter.js
	cp ./LICENSE ./build/chrome/LiveTL/
	cd build/chrome/ && zip -9r ../../dist/chrome/LiveTL.zip LiveTL/

firefox: init
	rm -rf dist/firefox/
	mkdir dist/firefox/
	mkdir -p build/firefox/
	cp -r LiveTL build/firefox/
	cp $(jquery) ./build/firefox/LiveTL/jquery.min.js
	cp $(jquery-ui) ./build/firefox/LiveTL/jquery-ui.min.js
	cp $(jquery-css) ./build/firefox/LiveTL/jquery-ui.css
	cat LiveTL/filter.js LiveTL/frame.js > ./build/firefox/LiveTL/frame.js
	rm ./build/firefox/LiveTL/filter.js
	rm ./build/firefox/LiveTL/*_test.js
	cp ./LICENSE ./build/firefox/LiveTL/
	grep -v incognito ./LiveTL/manifest.json > ./build/firefox/LiveTL/manifest.json
	cd build/firefox/LiveTL && zip -9r ../../../dist/firefox/LiveTL.zip *

clean:
	rm -rf dist/
	rm -rf build/
