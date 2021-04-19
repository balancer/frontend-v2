# Balancer App
Frontend Vue app for Balancer exchange and pool management.

## Development
To setup the development environment first clone the repo:
```bash
git clone https://github.com/balancer-labs/pool-management-v2.git && cd pool-management-v2
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
If you'd rather spin up the app in a docker container:

```bash
docker-compose up
```

The app should be live at [http://localhost:8080](http://localhost:8080)


## Design System
The app is using [Tailwind](https://tailwindcss.com/) to configure base styles. In development these styles can be viewed by running:

```bash
npm run tailwind-viewer
```
Your browser should load the app at [http://localhost:3000](http://localhost:3000).

### Component Library
We are using [Storybook](https://storybook.js.org/) to document our commonly used components. You can browse the component library in development by running:

```bash
npm run storybook
```
Your browser should load the app at [http://localhost:6006](http://localhost:6006).
