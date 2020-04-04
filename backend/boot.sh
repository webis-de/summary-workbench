#!/bin/sh

pipenv install --skip-lock    # install packages
pipenv run python setup.py    # download models
pipenv run python wsgi.py     # run server
