#!/bin/bash
set -e

# set working directory to script location
cd "${0%/*}"

if [ ! -f lib/rubberband-2.0.2.tar.bz2 ]; then
  [ -e lib ] && rm -r lib
  mkdir -p lib
  wget https://breakfastquay.com/files/releases/rubberband-2.0.2.tar.bz2 -P lib
  tar xmf lib/rubberband-2.0.2.tar.bz2 -C lib
  mv -v lib/rubberband-2.0.2 lib/rubberband
fi

# -fno-exceptions
# -ffast-math -ftree-vectorize
export CFLAGS="-Ilib/rubberband/rubberband -O3 -Oz -flto -fno-rtti"
export CXXFLAGS="${CFLAGS}"
export LDFLAGS="${CFLAGS}"

emcc ${CXXFLAGS} -c lib/rubberband/single/RubberBandSingle.cpp -o lib/librubberband.o
emcc ${CXXFLAGS} -c src/rubberband.c -o lib/rubberband.o

export EMCC_FLAGS="${LDFLAGS} \
  -s ENVIRONMENT='web,worker,node' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s STANDALONE_WASM=1 \
  -s ERROR_ON_UNDEFINED_SYMBOLS=1 \
  -s AUTO_JS_LIBRARIES=0 \
  -s FILESYSTEM=0 \
  -s ASSERTIONS=0 \
  --no-entry \
  --emit-symbol-map"

emcc ${EMCC_FLAGS} \
  lib/librubberband.o \
  lib/rubberband.o \
  -o lib/rubberband.js

mkdir -p dist
cp lib/rubberband.wasm dist/rubberband.wasm
