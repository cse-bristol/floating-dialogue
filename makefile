build: ; npm install; mkdir -p bin; browserify ./demo.js -o ./bin/demo.js

clean: ; rm -rf ./bin/*
