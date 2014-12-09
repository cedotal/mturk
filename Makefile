all: test

unittests:
	./node_modules/expresso/bin/expresso -g test/unit/test_*.js
	./node_modules/expresso/bin/expresso -g test/unit_isolated/test_*.js

functionaltests:
	./node_modules/expresso/bin/expresso -g test/functional/test_*.js

test: unittests functionaltests

.PHONY: test
