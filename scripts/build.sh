#!/bin/bash

echo "Building" $1
../../scripts/cleanup.sh
cp ../../tsconfig.json ./tsconfig.json
cp ../../types.d.ts ./types.d.ts

bundle="--outDir ./bin"
if [ "$3" == "true" ]; then
  bundle="--outFile ./bin/$1.js"
fi
../../node_modules/typescript/bin/tsc -m $2 $bundle --moduleResolution Node --target es2015 --removeComments true --listEmittedFiles true --allowSyntheticDefaultImports true --esModuleInterop true
echo "Build completed, cleaning up"
rm -rf ./tsconfig.json
rm -rf ./dist