all: chrome

.PHONY: init chrome clean

init:
	mkdir -p dist

chrome: init
	rm -rf dist/chrome/
	mkdir dist/chrome/
	zip -9r dist/chrome/LiveTL.zip LiveTL/

# TODO Add firefox build instructions

clean:
	rm -rf dist/
