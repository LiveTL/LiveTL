build: $(shell find src) node_modules
	NODE_ENV=production npm run build

node_modules: yarn.lock
	yarn