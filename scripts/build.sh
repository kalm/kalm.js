mkdir -p ./tmp
./node_modules/typescript/bin/tsc -p ./ --outDir ./tmp $2
./node_modules/rollup/bin/rollup ./tmp/$1 --format umd --name $1 --file $3
rm -rf ./tmp