#!/usr/bin/env bash

export VIRTUAL_ENV=/root/.venv
if [[ ! -r $VIRTUAL_ENV/bin/python ]] || [[ ! -f $VIRTUAL_ENV/bin/activate ]]; then
  echo "no valid virtualenv found, creating ..."
  rm -rf $VIRTUAL_ENV
  python -m venv $VIRTUAL_ENV || exit 1
fi
source $VIRTUAL_ENV/bin/activate || exit 1

cd /app || exit 1

pip install pipenv || exit 1
pipenv install || exit 1

python model_setup.py
uvicorn app:app --app-dir /app --host 0.0.0.0 --port 5000 --reload
