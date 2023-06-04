FROM node:16.17-alpine AS base

WORKDIR /app
COPY package*.json ./
COPY . .

FROM base AS build

ENV NODE_ENV=production
RUN npm i -g npm@9 pm2
RUN npm i --prefer-offline --no-audit --ignore-scripts
CMD npm run start-docker
