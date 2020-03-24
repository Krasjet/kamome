# --- build kamome ---
FROM node:13.10.1 AS build-kamome

WORKDIR /build

# dependencies
COPY package.json yarn.lock /build/
RUN yarn install --ignore-optional --non-interactive

COPY . /build/
RUN yarn build

# --- kamome ---
FROM nginx:latest

RUN rm -v /etc/nginx/nginx.conf

WORKDIR /app

COPY --from=build-kamome /build/dist/ /app/
