.PHONY: all build build-docker css

DOC = static/styles/doc

build: css node_modules
	yarn build

build-docker: css
	yarn build-docker

css: $(DOC)/main.css $(DOC)/reset.css $(DOC)/syntax.css

$(DOC)/syntax.css: sesq/pandoc.css
	command cp $< $@

$(DOC)/%.css: hane/%.css
	command cp $< $@

hane/%.css: hane/%.scss
	$(MAKE) -C hane

node_modules:
	yarn install
