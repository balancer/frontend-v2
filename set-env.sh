#!/bin/bash

if [ -z "$INFURA_API_KEY" ]; then
  echo "Please set the environment variable INFURA_API_KEY to run this image"
  exit 1
fi

if [ -z $(echo "$INFURA_API_KEY" | grep -oPe "^[a-z0-9]+$") ]; then
  echo "Please set INFURA_API_KEY to the last part of the URL, not the full URL"
  exit 1
fi

find ./dist -type f -exec sed -i 's/INFURA_API_KEY/'${INFURA_API_KEY}'/g' {} +