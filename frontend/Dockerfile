FROM node:16-slim as build-stage

WORKDIR /app
COPY . /app/
RUN npm ci
RUN npm run build

FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/build /srv/static
