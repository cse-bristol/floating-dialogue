build: ; npm install; mkdir -p bin; sudo browserify ./demo.js -o ./bin/demo.js

clean: ; rm -rf ./bin/*
