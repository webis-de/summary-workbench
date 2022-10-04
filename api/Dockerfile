FROM python:3.10

COPY . /app
WORKDIR /app
RUN pip install pipenv
RUN pipenv install --system && python model_setup.py

CMD uvicorn app:app --host 0.0.0.0 --port 5000


# vi: ft=dockerfile
