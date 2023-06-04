FROM node:16.17-alpine AS base

WORKDIR /app
COPY package*.json ./
COPY . .

FROM base AS build

# RUN npm i -g npm@9 pm2
RUN npm i --prefer-offline --no-audit --ignore-scripts
# start-docker will be used with our own server
CMD npm run start
