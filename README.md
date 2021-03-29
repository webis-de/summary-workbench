# Description

Web project build with Flask, Express.js and React.js to assess and investigate the quality of summarization tasks.

# Configuration
**note**: all paths are relative from the repository root

The application is managed with the `manage.py` script.
Run `pip install -r requirements.txt` to install all packages required by the `manage.py`.
The file `config.yaml` contains the config file for our application and can be used as an example or modified.
You can specify a custom config for the `manage.py` with the option `--config <path>`.
The `manage.py` has the following options:
- **build**: build the configured plugins (metrics, summarizers)
- **push**: push an image to dockerhub for later deployment
- **gen-docker-compose**: generate a docker-compose file for the local development of the application
- **gen-kubernetes**: generate deployment files for the deployment of the application

The `config.yaml` has the following options:
- **docker_username**: username of the dockerhub for pushing
- **deploy**: deployment configuration
    - **nodeport**: port where the application is exposed on the cluster
- **metrics**: list of configured metrics (path or git url to the metric folder or repository)
- **summarizers**: list of configured summarizers (path or git url to the summarizer folder or repository)

The plugins (metrics, summarizers) can have a detailed config instead of a path or git url:
- **source**: path or git url to the plugin folder or repository
- **config**: custom config which overrides the plugin config (e.g. for renaming if there is a name conflict, or changing the model) (see `Write a Plugin` Section)

# Write a Plugin

A Plugin is a Folder which contains the following files:
- config.yaml (required)
- Dockerfile (optional): used for building the production container, which will be deployed on the cluster
- Dockerfile.dev (optional): used for the local development environment
- metric.py or metric folder for metric plugin or summarizer.py or summarizer folder for summarizer plugin (required)
- model_setup.py (required): should download all models, can be empty if no external data is needed
- Pipfile.lock, Pipfile, or requirements (one required, if multiple given the first found is used)

Following Options can be specify in the `config.yaml`:
- **version** (required): version string of the plugin
- **name** (required): name of the plugin (only a-zA-Z0-9_ allowed) (e.g. bert)
- **readable** (required): name of the metric/summarizer for reading (e.g. BERTScore)
- **type** (required): type of metric (lexical, semantic) or summarizer (abstractive, extractive)
- **model** (optional): model which the plugin uses, will be available in the `PLUGIN_MODEL` environment variable
- **homepage** (optional): url of the homepage or the source of the paper or something similar
- **sourcecode** (optional): url where the sourcecode can be found
- **devimage** (required if Dockerfile.dev is not provided): available images can be found under `images/dev/`
- **deployimage** (required if Dockerfile is not provided): available images can be found under `images/deploy/`

Everything under `/root` in the container is stored in a volume.
If you have a model it should be stored there.

## Metric
The metric.py file should have a class `MetricPlugin` with the following methods:
- evaluate(self, hypotheses, references)
    - hypotheses: list of strings
    - references: list of strings
    - len(hypotheses) is equal to len(references)
    - returns: a dictionary, which contains the computed scores (e.g. {"BERTScore": 0.1})

## Summarizer
The summarizer.py file should have a class `SummarizerPlugin` with the following methods:
- summarize(self, text, ratio)
    - text: string from which the summary is to be generated
    - ratio: number between 0 and 1 which can be used to control the length of the summary
    - returns: a string or a list of sentences which is the generated summary

# Development

## Setup
**requirements**: install docker and docker-compose on your system and make sure the docker service is running (`sudo systemctl start docker.service`)  

Generate a docker-compose file for the local development of the application with `./manage.py gen-docker-compose`.
Uncomment the services which you don't need in the `config.yaml` to prevent unnecessary RAM usage.
The application can be accessed via `localhost:3000`.  

The `api` and `frontend` containers are available even before the other containers are done initializing.
Some parts of the applications will only become available over time, because they are busy downloading a model.
If you worry about the status of the application run `docker-compose ps`.
If there is no service with state `Exited`, than everything should be fine.
Alternatively use `docker-comose logs <service>` for troubleshooting.


# Production
## Deployment on Kubernetes

Use `./manage.py gen-kubernetes` to generate the kubernetes service files and which can be found under `deploy/`.
Before deploying you need to build the necessary images and push them to dockerhub with `./manage.py build` and `./manage.py push`

# Used Metrics and Implementations

- BERT: [Tiiiger/bert_score](https://github.com/Tiiiger/bert_score) (**model**: roberta-large-mnli)
- BLEU: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- BLEURT: [google-research/bleurt](https://github.com/google-research/bleurt) (**model**: bleurt-base-128)
- CIDEr: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- METEOR: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- MoverScore: [AIPHES/emnlp19-moverscore](https://github.com/AIPHES/emnlp19-moverscore) (**model**: distilbert-base-uncased)
- greedy matching: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval) (**model**: glove.6B.300d)
- ROUGE: [pltrdy/rouge](https://github.com/pltrdy/rouge)

# Similar Projects

- [vizseq](https://github.com/facebookresearch/vizseq)
- [SummEval](https://github.com/Yale-LILY/SummEval)
