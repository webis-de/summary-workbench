FROM nikolaik/python-nodejs:python3.8-nodejs15-slim

USER 0:0
WORKDIR /app
COPY . /app/
RUN pip3 install newspaper3k flask nltk
RUN npm ci

CMD node /app/index.js
