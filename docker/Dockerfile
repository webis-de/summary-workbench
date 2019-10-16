FROM python:3

WORKDIR /application

RUN pip install pipenv; \
    git clone https://github.com/vishnubob/wait-for-it.git /wait; \
    echo "PS1='\[\033[01;31m\]container\[\033[00m\]: '" >> /root/.bashrc

CMD bash
