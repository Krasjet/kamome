.PHONY: all build

build: all
	yarn build

all: static/styles/doc/main.css static/styles/doc/reset.css static/styles/doc/syntax.css

static/styles/doc/main.css: hane/main.scss
	$(MAKE) -C hane
	/bin/cp hane/main.css static/styles/doc/main.css

static/styles/doc/reset.css: hane/reset.scss
	$(MAKE) -C hane
	/bin/cp hane/reset.css static/styles/doc/reset.css

static/styles/doc/syntax.css: sesq/pandoc.css
	/bin/cp sesq/pandoc.css static/styles/doc/syntax.css
