# This Dockerfile runs a production build of balancer. 
# It requires specifying an Infura API key to pull data. 
# See README for futher information

FROM node:14 AS base

ENV APP_ROOT /app
RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

FROM base AS dependencies

COPY prepare.js ./
COPY package*.json ./

RUN npm install -g npm@7
RUN npm ci

FROM dependencies AS build

COPY . .
RUN npm run build -- --mode docker --skip-plugins webpack-bundle-analyzer

FROM nginx:1.22.1-alpine as release

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/scripts/docker-init.sh /
EXPOSE 80

CMD ["/docker-init.sh"]