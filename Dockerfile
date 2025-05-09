FROM node:22-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY ./src /app/src

ENV NODE_ENV=docker-dev
ENV NMR_DATA_PATH_AUTO=/app/nmr-data/auto
ENV NMR_DATA_PATH_MANUAL=/app/nmr-data/manual

CMD ["npm", "run", "docker-dev"]

