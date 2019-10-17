#!/bin/sh

pipenv install
pipenv run sh -c "flask run -h 0.0.0.0"
