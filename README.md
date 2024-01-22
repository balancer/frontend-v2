# Balancer Frontend App (v2)

Official frontend app for the Balancer protocol (v2)

## Development

To setup the development environment first clone the repo:

```bash
git clone https://github.com/balancer/frontend-v2.git && cd frontend-v2
```

### Local env

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

The app should be live at [http://localhost:8080](http://localhost:8080)

### Testing

Run unit tests:

```bash
npm run test:unit
```

Run unit tests in watch mode:

```bash
npm run test:unit:watch
```

Run unit tests with coverage:

```bash
npm run test:unit:coverage
```

Run unit tests with only lcov coverage (useful when doing exploratory testing):

```bash
npm run test:unit:silent:coverage
```

### Build

Run build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Run build in watch mode:

```bash
npm run build:watch
```

This mode is useful when you need to reproduce/fix bugs/issues in a **production-like** environment.

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

### Custom RPC urls

To override RPC network config set in `src/lib/config`, you can use the following environment variables:

`VITE_RPC_URL_<networkId>=XXX`

### One Click Deploys

The frontend can easily be deployed to any static host. Use the buttons below to spin up an instance. You will be prompted to provide your Infura Project ID, Alchemy Key, and Blocknative Dapp ID as these are required for the frontend to work correctly.

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/balancer/frontend-v2/tree/master)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/balancer/frontend-v2)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/balancer/frontend-v2)

## Vite setup

This app is powered by [vite](https://vitejs.dev/), which:

- Runs a development dev server with [esbuild](https://esbuild.github.io/).
- Builds production bundle with [Rollup](https://rollupjs.org/guide/en/).

Both tools above rely on native ES modules but our app also depends on libraries like [ethers.js](https://docs.ethers.io/) which use Node.js built-in modules (like Buffer, stream or crypto) that require browser polyfills. Thats why our `vite.config.ts` uses `node-pollyfills` and [rollup-plugin-polyfill-node](https://www.npmjs.com/package/rollup-plugin-polyfill-node).

### unplugin-vue magic 🪄

We use some Vite plugins to improve the Vue developer experience.

[unplugin-vue-components](https://github.com/antfu/unplugin-vue-components):

Auto imports components located in `src/components/_global` so that they are available from every other component in the application (and from _vitest_).
(It also auto generates a _d.ts_ file for the auto imported components).

### Analyze bundle

Analyze and visualize the bundle dependencies:

```bash
npm run build:analyze
```
