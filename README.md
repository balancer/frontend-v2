# Balancer Frontend App (v2)

Frontend Vue app for Balancer exchange and pool management.

## Development

To setup the development environment first clone the repo:

```bash
git clone https://github.com/balancer-labs/frontend-v2.git && cd frontend-v2
```

### Local env

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run serve
```

The app should be live at [http://localhost:8080](http://localhost:8080)

### Docker

If you'd rather spin up the app in a docker container, first install dependencies to you local folder:

```bash
docker-compose build
docker-compose run --rm web npm i
```

and start the app:

```bash
docker-compose up
```

The app should be live at [http://localhost:8080](http://localhost:8080)

If you are on Apple Silicon, try this:

```bash
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

source: https://stackoverflow.com/questions/65612411/forcing-docker-to-use-linux-amd64-platform-by-default-on-macos

## Self-Hosting

As we believe in decentralization at all layers, we've made it easy to host your own Balancer Frontend.

### Docker Production Image

We've created a production ready [docker image](./Dockerfile) runs
a pre-built version of Balancer Frontend-v2 using nginx. You'll need your own
[Infura](https://infura.io), [Alchemy](https://www.alchemy.com/), and
[Blocknative](https://blocknative.com) API keys in order to fetch data and
execute transactions.

Here's an example of how to run the container. This can also be found in [scripts/run-docker.sh](./scripts/run-docker.sh).

```bash
docker run \
  -e INFURA_PROJECT_ID=   \ # Required
  -e ALCHEMY_KEY=         \ # Required
  -e BLOCKNATIVE_DAPP_ID= \ # Required
  balancerfi/frontend-v2
```

### Digital Ocean Deploy

Click the button below to deploy the frontend Docker image to a new instance in your Digital Ocean account. You will be prompted to provide your Infura Project ID, Alchemy Key, and Blocknative Dapp ID as these are required for the frontend to work correctly.

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/balancer-labs/frontend-v2/tree/UI-769-one-click-deploy-to-digital-ocean)
