.PHONY: all build

build: css
	yarn build

build-docker: css
	yarn build-docker

css: static/styles/doc/main.css static/styles/doc/reset.css static/styles/doc/syntax.css

static/styles/doc/main.css: hane/main.scss
	$(MAKE) -C hane
	/bin/cp hane/main.css static/styles/doc/main.css

static/styles/doc/reset.css: hane/reset.scss
	$(MAKE) -C hane
	/bin/cp hane/reset.css static/styles/doc/reset.css

static/styles/doc/syntax.css: sesq/pandoc.css
	/bin/cp sesq/pandoc.css static/styles/doc/syntax.css
