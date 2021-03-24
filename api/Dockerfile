FROM nikolaik/python-nodejs:python3.8-nodejs15-slim

WORKDIR /app
COPY . /app/
RUN pip3 install newspaper3k flask nltk
RUN npm ci

CMD node /app/index.js
