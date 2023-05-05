FROM node:18-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY ./src /app/src

ENV NODE_ENV=docker-dev
ENV NMR_DATA_PATH=/app/nmr-data

CMD ["npm", "run", "docker-dev"]

