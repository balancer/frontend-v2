# This Dockerfile runs a production build of balancer. 
# It requires specifying an Infura API key to pull data. 
# See README for futher information

FROM node:14 AS base

RUN npm install -g npm@7
ENV APP_ROOT /app
RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}
ADD . ${APP_ROOT}

FROM base AS dependencies

RUN npm install
FROM dependencies AS build

RUN npm install -g http-server
RUN npm run build -- --mode production

FROM build AS release

EXPOSE 8080

CMD ./set-env.sh && http-server -a 0.0.0.0 -p 8080 ./dist