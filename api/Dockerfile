FROM nikolaik/python-nodejs:python3.9-nodejs16-slim

WORKDIR /app
COPY . /app/
RUN rm -f /app/plugin_config.json
RUN pip3 install --no-cache-dir newspaper3k nltk flask
RUN npm ci

CMD node /app/index.js
