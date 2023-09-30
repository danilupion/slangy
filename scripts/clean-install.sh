#!/bin/bash

rm -rf node_modules packages/*/node_modules apps/*/node_modules;

# Check if --delete-lock or -dl parameter is provided, if so delete yarn.lock
if [[ $1 == "--delete-lock" ]] || [[ $1 == "-dl" ]]; then
  rm -f yarn.lock;
fi

yarn;
