FROM node:16-buster

LABEL MAINTAINER = 'Zihad <zihadmahiuddin@gmail.com>'
ENV SKIP_PREFLIGHT_CHECK=true

RUN apt update && apt install -y make gcc g++ python git build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

WORKDIR /app

COPY yarn.lock package.json ./
COPY bot/package.json ./bot/package.json
COPY common/package.json ./common/package.json
COPY web/package.json ./web/package.json
RUN yarn install-web

COPY frontend ./frontend
RUN cd frontend && yarn

COPY bot ./bot
COPY common ./common
COPY pagecord.js ./pagecord.js
COPY web ./web
RUN yarn build-web
RUN cd frontend && yarn build

RUN cp -r frontend/build /dist/web/build

RUN apt remove -y --purge make gcc g++ python git

CMD ["node", "/dist/index.js"]