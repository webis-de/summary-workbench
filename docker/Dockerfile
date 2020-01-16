FROM python:3.7

RUN apt update && apt --yes install default-jre

RUN pip install pipenv; \
    echo "PS1='\[\033[01;31m\]container\[\033[00m\]: '" >> /root/.bashrc
