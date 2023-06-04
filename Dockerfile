FROM node:18.16-alpine AS base

WORKDIR /app
COPY package*.json ./
COPY . .

FROM base AS build

ENV NODE_ENV=production
# install pm2 if we use our own server
# RUN npm i -g pm2
RUN npm i --prefer-offline --no-audit --ignore-scripts
# start-docker will be used with our own server (nginx has to be configured correctly)
CMD npm run start
