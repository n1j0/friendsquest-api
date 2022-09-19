FROM node:16.17-alpine as base

WORKDIR /app
COPY package*.json ./app
COPY . /app

FROM base as production

ENV NODE_ENV=production
RUN npm ci --prefer-offline --no-audit --ignore-scripts
RUN npm run build
RUN npm ci --omit=dev --prefer-offline --no-audit --ignore-scripts

CMD npm run start

FROM base as dev

ENV NODE_ENV=development
RUN npm ci --prefer-offline --no-audit --ignore-scripts
CMD npm run dev
