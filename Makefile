all: chrome firefox

.PHONY: init chrome firefox clean

init:
	mkdir -p dist

chrome: init
	rm -rf dist/chrome/
	mkdir dist/chrome/
	zip -9r dist/chrome/LiveTL.zip LiveTL/

firefox: init
	rm -rf dist/firefox/
	mkdir dist/firefox/
	cd LiveTL && zip -9r ../dist/firefox/LiveTL.zip *
	ln -s ./dist/firefox/LiveTL.zip ./dist/firefox/LiveTL.crx

clean:
	rm -rf dist/
