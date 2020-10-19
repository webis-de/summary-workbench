ARG image=python:3.8

FROM ${image} as lock-stage
WORKDIR /app
COPY . .
RUN pip install pipenv
RUN pipenv lock --requirements | tee requirements.txt

FROM ${image}
WORKDIR /app
COPY . .
COPY --from=lock-stage /app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000
ENV GUNICORN_CMD_ARGS -cgunicorn.conf.py
CMD ["gunicorn", "wsgi:app"]
