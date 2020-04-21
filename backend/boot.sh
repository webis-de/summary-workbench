#!/bin/sh

if [ "$INSTALL_ALWAYS" = "yes" ]; then
    INSTALL_PACKAGES="yes"
elif ! pipenv --venv > /dev/null 2>&1; then
    INSTALL_PACKAGES="yes"
else
    INSTALL_PACKAGES="no"
fi

if [ "$INSTALL_PACKAGES" = "yes" ]; then
    pipenv install --skip-lock --verbose   # install packages
fi

pipenv run python setup.py             # download models
pipenv run python wsgi.py              # run server
