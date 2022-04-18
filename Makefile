export PATH := $(shell pwd)/node_modules/.bin:$(PATH)

.PHONY: publish 

clean: 
	rm -rf dist

publish: clean
	pnpm install
	pnpm run build
	npm version patch
	npm publish
	git push