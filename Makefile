REPORTER = dot

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER)

test-md:
		@$(MAKE) test REPORTER=markdown > test/spec.md

.PHONY: test
