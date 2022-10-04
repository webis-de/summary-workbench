#!/usr/bin/env bash

export VIRTUAL_ENV=/root/.venv
[[ -f $VIRTUAL_ENV/bin/activate ]] || python -m venv $VIRTUAL_ENV || exit 1
source $VIRTUAL_ENV/bin/activate || exit 1

cd /app || exit 1

pip install pipenv || exit 1
pipenv install || exit 1

python model_setup.py
uvicorn app:app --app-dir /app --host 0.0.0.0 --port 5000 --reload
