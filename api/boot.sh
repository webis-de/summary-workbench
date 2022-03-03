#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

function loop_grobid() {
  while :; do
    cd $PDF_EXTRACTOR_HOME/grobid-0.6.1
    ./gradlew run &>/dev/null
    echo "grobid failed"
    sleep 5
  done
}

function init_grobid() {
  echo "starting grobid"
  loop_grobid &
  RETRY=0
  MAX_RETRY=120
  while ! curl http://localhost:8070 &>/dev/null; do
    RETRY=$((RETRY+1))
    echo "grobid not ready $RETRY/$MAX_RETRY"
    sleep 1
    if [[ $RETRY -gt $MAX_RETRY ]]; then
      echo "init too long, abort"
      exit 1
    fi
  done
  echo "grobid init..."
  python $SCRIPT_DIR/grobid/initial_request.py
  echo "init done"
}

npm install
init_grobid
if [[ $NODE_ENV == "production" ]]; then
  node /app/index.js
else
  /app/node_modules/.bin/nodemon /app/index.js
fi
