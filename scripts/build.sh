#!/bin/bash

echo "Building" $1
../../scripts/cleanup.sh
cp ../../tsconfig.json ./tsconfig.json
../../node_modules/typescript/bin/tsc --outDir ./bin
echo "Build completed, cleaning up"
rm -rf ./tsconfig.json
rm -rf ./dist