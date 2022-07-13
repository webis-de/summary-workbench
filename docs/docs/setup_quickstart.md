---
slug: /
sidebar_position: 1
title: Setup Quickstart
---

## Setup

1. Install python, docker, and docker-compose
2. Make sure the docker daemon is running
3. Clone the repository to your computer
4. Go to the repositories root
5. Run `pip install -r requirements.txt`

## First application

Create a file named `my.sw-config.yaml` in the project root and write the following content to the file:

```yaml
metrics:
  - ./metrics/rouge
  - ./metrics/bleu
  - source: ./metrics/sbert
    disabled: true

summarizers:
  - ./summarizers/extractive
  - ./summarizers/textrank
  - source: ./summarizers/neuralsum
    disabled: true
    environment:
      model: T5
```

This will configure `BLEU`, `ROUGE`, and `sentence transformers` as evaluation metrics, and `neuralsum` with the `T5` model, our custom `extractive` summarizer, and `textrank` as summarizers.

:::note

If the `disabled` option is set to `true`, the plugin will not be loaded but information about the plugin will still be displayed in the demo.
The disabled plugins in the example load large neural models. You can set `disabled` to `false` if you have enough space to load the plugins.

:::

:::note

With the `environment` option you can specify environment variables for the container in which the plugin gets loaded.
For the `neuralsum` plugin the `model` variable is required.

:::

You can find a `configure.py` file in the project root.  
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

The `configure.py` file takes the `sw-config.yaml` as default config, when no config is specified via `--config`.
Inspect this file if you want to get an overview of what a full config looks like.

:::

:::note

For a overview of available plugins checkout the `metrics/` and `summarizers/` folders in the repository

:::
