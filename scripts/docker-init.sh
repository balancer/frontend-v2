#!/bin/sh

if [ -z "$INFURA_PROJECT_ID" ]; then
  echo "Please set the environment variable INFURA_PROJECT_ID to run this image"
  exit 1
fi

if [ -z $(echo "$INFURA_PROJECT_ID" | grep -E "^[a-z0-9]+$") ]; then
  echo "Please set INFURA_PROJECT_ID to your project ID, not the full endpoint URL"
  exit 1
fi

if [ -z "$ALCHEMY_KEY" ]; then
  echo "Please set the environment variable ALCHEMY_KEY to run this image"
  exit 1
fi

if [ -z $(echo "$ALCHEMY_KEY" | grep -E "^[A-Za-z0-9]+$") ]; then
  echo "Please set ALCHEMY_KEY to the last part of the endpoint URL, not the full endpoint URL"
  exit 1
fi

if [ -z "$BLOCKNATIVE_DAPP_ID" ]; then
  echo "Please set the environment variable BLOCKNATIVE_DAPP_ID to run this image."
  echo "This is your Blocknative API Key / Dapp ID in your account dashboard."
  exit 1
fi

find /usr/share/nginx/html -type f -exec sed -i 's/VAINFURAPID/'${INFURA_PROJECT_ID}'/g' {} +;
find /usr/share/nginx/html -type f -exec sed -i 's/VAALCHEMYKEY/'${ALCHEMY_KEY}'/g' {} +;
find /usr/share/nginx/html -type f -exec sed -i 's/VABNDAPPID/'${BLOCKNATIVE_DAPP_ID}'/g' {} +;

# Portis is optional, will replace with empty string if not specified and then use default from config
find /usr/share/nginx/html -type f -exec sed -i 's/VAPORTISDID/'${PORTIS_DAPP_ID}'/g' {} +;

nginx -g "daemon off;"