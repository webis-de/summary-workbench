ARG image=python:3.8

FROM ${image} as lock-stage
WORKDIR /app
COPY . .
RUN pip install pipenv
RUN pipenv lock --requirements > requirements.txt

FROM ${image}
WORKDIR /app
COPY . .
COPY --from=lock-stage /app/requirements.txt .

RUN apt update && apt --yes install default-jre-headless
RUN pip install --no-cache-dir -r requirements.txt
