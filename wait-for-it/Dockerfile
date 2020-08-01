ARG image=alpine

FROM ${image} as build-stage
RUN apk add curl bash
RUN curl -O https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && chmod 755 wait-for-it.sh
