#!/bin/sh

pipenv install
pipenv run sh -c "flask setup && python wsgi.py"
