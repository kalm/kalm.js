echo "Building" $1
mkdir -p ./bin
rm -rf ./bin/*
cp ../../tsconfig.json ./tsconfig.json
../../node_modules/typescript/bin/tsc --outDir ./bin
echo "Copying .d.ts file to bin"
cp ../../types.d.ts ./bin/types.d.ts
echo "Build completed, cleaning up"
rm -rf ./tsconfig.json