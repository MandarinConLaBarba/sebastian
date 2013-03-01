REPORTER = dot

build:
	@mkdir -p vendor/sinon \
	&& wget http://sinonjs.org/releases/sinon-1.6.0.js -O vendor/sinon/sinon.js \
	&& bower install --dev

clean:
	@rm -rf vendor/

test:
	@./node_modules/.bin/mocha test/index --reporter $(REPORTER)

test-md:
		@$(MAKE) test REPORTER=markdown > test/spec.md

.PHONY: test
