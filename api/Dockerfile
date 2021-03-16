FROM python:3.8-slim

WORKDIR /app
COPY . /app/
RUN apt update && apt install -y nodejs npm && pip3 install newspaper3k flask nltk
RUN npm ci

CMD node /app/index.js
