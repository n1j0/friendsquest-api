FROM node:16.17-alpine AS base

WORKDIR /app
COPY package*.json ./
COPY . .

FROM base AS build

ENV NODE_ENV=development
RUN npm i --prefer-offline --no-audit --ignore-scripts
CMD npm run start
