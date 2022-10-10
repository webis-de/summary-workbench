---
sidebar_position: 1
title: Setup Quickstart
---

## Setup

1. Install python, docker, and docker-compose and start the docker service
2. Open a terminal, clone the repository and go to the repository root
3. Run `pip install -r requirements.txt`, which will install all neccessary packages for the ./configure.py script

## First application

Create a file named `my.sw-config.yaml` in the project root and write the following content to the file:

```yaml
extern_environment:
  THREADS: 4
  BATCH_SIZE: 32
  CACHE_SIZE: 1000

metrics:
  - ./metrics/rouge
  - ./metrics/bleu
  - source: ./metrics/sbert
    disabled: true

summarizers:
  - ./summarizers/featuresum
  - ./summarizers/textrank
  - source: ./summarizers/neuralsum
    disabled: true
    environment:
      model: T5
```

This will configure `BLEU`, `ROUGE`, and `Sentence-BERT` as evaluation metrics, and `neuralsum` with the `T5` model, our custom `featuresum` summarizer, and `TextRank` as summarizers.

:::note

If the `disabled` option is set to `true`, the plugin will not be loaded but information about the plugin will still be displayed in the demo.
The disabled plugins in the example load large neural models. You can set `disabled` to `false` if you have enough space on your system.

:::

:::note

With the `environment` option you can specify environment variables for the container in which the plugin gets loaded.
For the `neuralsum` plugin the `model` variable is required.

:::

You can find the `configure.py` file in the project root.  
Run the following command to generate a docker-compose file in the project root:

```bash
./configure.py --config my.sw-config.yaml gen-docker-compose
```

Run the following command to start the application:

```bash
docker-compose up -d
```

The frontend will be exposed on `localhost:3000` and the backend on `localhost:5000`
Go to `http://localhost:3000` to use the application.

:::note

The startup may take some time and the frontend usually becomes available earlier than the backend.
Also with the first startup the containers will be build and models will be downloaded.
Therefore future startups won't take as long as the first.

:::

:::note

The `sw-config.yaml` file in the project root will be used as the default config by `configure.py` when `--config` is omitted.
Inspect this file if you want to get an overview of what a full config looks like.

:::

:::note

For a overview of available plugins checkout the `metrics/` and `summarizers/` folders in the repository

:::

## Extern Environment

The `extern_environment` option sets environment variables in all plugin containers.
The following environment variables are used to configure the plugin server.

| Name       | Default | Description                                                                                                                                       |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| THREADS    | 1       | The number of parallel calls to the summarize function.                                                                                           |
| BATCH_SIZE | 32      | This is the maximal length that the `batch` argument will have (see [writing-a-plugin#required-arguments](writing-a-plugin#required-arguments)) |
| CACHE_SIZE | 0       | The size of the LRU cache. A unique sha256 key will be generated based on the input and the arguments. 0 disables the cache.                          |
