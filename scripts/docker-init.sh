#!/bin/sh

if [ -z "$INFURA_PROJECT_ID" ]; then
  echo "Please set the environment variable INFURA_PROJECT_ID to run this image"
  exit 1
fi

if [ -z $(echo "$INFURA_PROJECT_ID" | grep -E "^[a-z0-9]+$") ]; then
  echo "Please set INFURA_PROJECT_ID to your project ID, not the full Endpoint URL"
  exit 1
fi

find /usr/share/nginx/html -type f -exec sed -i 's/INFURAPID/'${INFURA_PROJECT_ID}'/g' {} +;

nginx -g "daemon off;"