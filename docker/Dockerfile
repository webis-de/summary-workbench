FROM python:3.7

WORKDIR /application

RUN apt update && apt --yes install \
        default-jre

RUN pip install pipenv; \
    git clone https://github.com/vishnubob/wait-for-it.git /wait; \
    echo "PS1='\[\033[01;31m\]container\[\033[00m\]: '" >> /root/.bashrc

CMD bash
