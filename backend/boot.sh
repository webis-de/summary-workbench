#!/bin/sh

if ! pipenv --venv > /dev/null 2>&1; then
    INSTALL_PACKAGES="yes"
elif [ "$INSTALL_ALWAYS" = "no" ]; then
    INSTALL_PACKAGES="no"
else
    INSTALL_PACKAGES="yes"
fi

if [ "$INSTALL_PACKAGES" = "yes" ]; then
    pipenv install --skip-lock --verbose   # install packages
fi

pipenv run python setup.py             # download models
pipenv run python wsgi.py              # run server
