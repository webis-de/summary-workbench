#!/usr/bin/env bash

export VIRTUAL_ENV=/root/.venv
[[ -f $VIRTUAL_ENV/bin/activate ]] || python -m venv $VIRTUAL_ENV || exit 1
source $VIRTUAL_ENV/bin/activate || exit 1


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

init_grobid

cd /app || exit 1

pip install pipenv || exit 1
pipenv install || exit 1

python model_setup.py
uvicorn app:app --app-dir /app --host 0.0.0.0 --port 5000 --reload
