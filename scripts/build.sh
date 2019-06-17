echo "Building" $1
mkdir -p ./tmp
rm -rf ./tmp/*
../../node_modules/typescript/bin/tsc --outDir ./tmp
echo "Compiled Typescript, rolling up"
../../node_modules/rollup/bin/rollup ./tmp/packages/$1/src/$1.js --format umd --name $1 --file ./bin/$1.min.js
echo "Build completed, cleaning up"
rm -rf ./tmp