#!/bin/bash 

docker run \
  -e INFURA_PROJECT_ID= \
  -e ALCHEMY_KEY= \
  -e BLOCKNATIVE_DAPP_ID= \
  balancerfi/frontend-v2
