all: chrome firefox

.PHONY: init chrome firefox clean

init:
	mkdir -p dist/
	mkdir -p build/common/
	curl -s -o build/common/jquery.min.js https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js & \
	curl -s -o build/common/jquery-ui.min.js https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js & \
       	wait

chrome: init
	rm -rf dist/chrome/
	mkdir dist/chrome/
	mkdir -p build/chrome/LiveTL/
	cp -r LiveTL/ build/chrome/
	cp ./build/common/jquery.min.js ./build/chrome/LiveTL/jquery.min.js
	cp ./build/common/jquery-ui.min.js ./build/chrome/LiveTL/jquery-ui.min.js
	cd build/chrome/ && zip -9r ../../dist/chrome/LiveTL.zip LiveTL

firefox: init
	rm -rf dist/firefox/
	mkdir dist/firefox/
	cd LiveTL && zip -9r ../dist/firefox/LiveTL.zip *
	cp ./dist/firefox/LiveTL.zip ./dist/firefox/LiveTL.crx

clean:
	rm -rf dist/
	rm -rf build/
