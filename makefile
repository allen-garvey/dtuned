SRC != find ./src -type f -name '*.d'

all: dev

dev:
	dmd $(SRC) -of./bin/dtuned -od./bin -unittest

release:
	dmd $(SRC) -of./bin/dtuned -od./bin -O -inline