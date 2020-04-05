#!/bin/sh

pipenv install --skip-lock --verbose   # install packages
pipenv run python setup.py             # download models
pipenv run python wsgi.py              # run server
