#!/bin/bash

mkdir -p ../tmp

../command.js \
  --template-path ./templates/basic \
  --include ./assets/basic.css \
  ./assets/basic.html -o ../tmp/basic.pdf

open ../tmp/basic.pdf
