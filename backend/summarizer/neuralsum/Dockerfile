# Choose the model you want to have and run: 'docker build --build-arg NEURALSUM_MODEL=<your model> .'

ARG image=python:3.8

FROM ${image} as lock-stage
WORKDIR /app
COPY . .
RUN pip install pipenv
RUN pipenv lock --requirements | tee requirements.txt

FROM ${image}
ARG NEURALSUM_MODEL
ENV NEURALSUM_MODEL=${NEURALSUM_MODEL}
RUN echo "$NEURALSUM_MODEL"
RUN if [ -z "$NEURALSUM_MODEL" ]; then echo "NEURALSUM_MODEL is not set, run 'docker build --build-arg NEURALSUM_MODEL=<your model> .'"; false; fi
WORKDIR /app
COPY . .
COPY --from=lock-stage /app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN python model_setup.py

EXPOSE 5000
ENV GUNICORN_CMD_ARGS -cgunicorn.conf.py
CMD ["gunicorn", "wsgi:app"]
