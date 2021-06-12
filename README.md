# Description

Web project build with Flask, Express.js and React.js to assess and investigate the quality of summarization tasks.

# Configuration

## manage.py

The application can be customized with the `manage.py` script (install required packages: `pip install -r requirements.txt`).  
The `manage.py` has the following options:

| command            | description                                                  |
| ------------------ | ------------------------------------------------------------ |
| build              | build images for the plugins (metrics, summarizers)          |
| push               | push an image to dockerhub for later deployment              |
| gen-docker-compose | generate a docker-compose.yaml to run the application localy |
| gen-kubernetes     | generates kubernetes files for the deployment                |

If you want to run the application localy, only `gen-docker-compose` is relevant for you (see [Development / run application localy](#development-run-application-localy)).

## Application config.yaml

The application is configured with the `config.yaml` file (specify a custom config with the option `--config <path>`).  
The `config.yaml` has the following options:

| option          | required for         | description                                                                  |
| --------------- | -------------------- | ---------------------------------------------------------------------------- |
| docker_username | push, gen-kubernetes | username of your dockerhub                                                   |
| deploy          | gen-kubernetes       | generate deployment files                                                    |
| metrics         | all                  | list of metrics (path or git url to the metric folder or repository)         |
| summarizers     | all                  | list of summarizers (path or git url to the summarizer folder or repository) |

Suboptions for `deploy`:

| option   | description                         |
| -------- | ----------------------------------- |
| nodeport | port where application gets exposed |

Suboptions for `metrics` and `summarizers`:

| option | description                                                                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| source | path or git url to the plugin folder or repository                                                                                                                     |
| config | custom config which overrides the plugin config (e.g. for renaming if there is a name conflict, or changing the model) (see [Write a Plugin](#write-a-plugin) Section) |

# Write a Plugin

A plugin is a folder or git repository which contains the following files:

| file                                                       | required                                 | description                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| config.yaml                                                | yes                                      | see [plugin config.yaml](#plugin-configyaml)                                                                                                                                                                                                                                                                                                                                 |
| Dockerfile                                                 | if config.yaml contains no `deployimage` | used for building the deployment image                                                                                                                                                                                                                                                                                                                                       |
| Dockerfile.dev                                             | if config.yaml contains no `devimage`    | used for building the development image                                                                                                                                                                                                                                                                                                                                      |
| metric.py, metric folder, summarizer.py, summarizer folder | yes (one)                                | metric.py or metric folder for metric plugin (see [Metric](#metric)), summarizer.py or summarizer folder for summarizer plugin (see [Summarizer](#summarizer))                                                                                                                                                                                                               |
| model_setup.py                                             | yes                                      | Is used to setup your application (i.e. download models). Leave it empty if no external data is needed. The file is required to remind the plugin creator that external data should be stored localy. All plugins can run without writing anything into this file but this can lead to performance issues (i.e. the models are downloaded on every restart of the container) |
| Pipfile.lock, Pipfile, requirements.txt                    | yes (one)                                | contains the packages required by your application                                                                                                                                                                                                                                                                                                                           |

## Plugin config.yaml

Following Options can be specify in the `config.yaml`:

| option      | required                          | description                                                                               |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| version     | yes                               | version string of the plugin                                                              |
| name        | yes                               | name of the plugin (only a-zA-Z0-9\_ allowed) (e.g. bert)                                 |
| readable    | yes                               | name of the metric/summarizer for reading (e.g. BERTScore)                                |
| type        | yes                               | type of metric (lexical, semantic) or summarizer (abstractive, extractive)                |
| model       | no                                | model which the plugin uses, will be available in the `PLUGIN_MODEL` environment variable |
| homepage    | no                                | url of the homepage or the source of the paper or something similar                       |
| sourcecode  | no                                | url where the sourcecode can be found                                                     |
| devimage    | if Dockerfile.dev is not provided | available images can be found under `images/dev/` (i.e. default, slim, java)              |
| deployimage | if Dockerfile is not provided     | available images can be found under `images/deploy/` (i.e. default, slim, java)           |

Everything under `/root` in the container is stored in a volume.  
If you have a model it should be stored there.

## Metric

The metric.py file should have a class `MetricPlugin` with the following methods:

- evaluate(self, hypotheses, references)
  - hypotheses: list of strings
  - references: list of strings
  - len(hypotheses) is equal to len(references)
  - returns: a number/score or a dictionary, which contains the computed scores (e.g. {"1": 0.1, "l": 0.1}). in the frontend the entries of the dictionary will be combined with the name of the plugin e.g. when the name is `rouge`, the example becomes {"rouge 1": 0.1, "rouge l": 0.1}

## Summarizer

The summarizer.py file should have a class `SummarizerPlugin` with the following methods:

- summarize(self, text, ratio)
  - text: string from which the summary is to be generated
  - ratio: number between 0 and 1 which can be used to control the length of the summary
  - returns: a string or a list of sentences which is the generated summary

# Development / run application localy

**requirements**: install docker and docker-compose on your system and make sure the docker service is running (`sudo systemctl start docker.service`)

Generate a docker-compose file for the local development of the application with `./manage.py gen-docker-compose`.
Comment the services which you don't need in the `config.yaml` to prevent unnecessary RAM usage.
The application can be accessed via `localhost:3000`.

The `api` and `frontend` containers are available even before the other containers are done initializing.
Some parts of the applications will only become available over time, because they are busy downloading a model.
If you worry about the status of the application run `docker-compose ps`.
If there is no service with state `Exited`, than everything should be fine.
Alternatively use `docker-compose logs <service>` for troubleshooting.

# Production

## Deployment on Kubernetes

Use `./manage.py gen-kubernetes` to generate the kubernetes service files and which can be found under `deploy/`.
Before deploying you need to build the necessary images and push them to dockerhub with `./manage.py build` and `./manage.py push`

# Api Documentation

The application consists of an frontend with a REST based backend/api.  
Therefore the application can be used without the frontend.

api location: `http://<domain>:<port>/api`

- development: `http://localhost:5000/api`
- production: `http://<your-domain>:<nodeport>/api`

**get information about all available metrics**:

- method: GET
- location: `http://<domain>:<port>/api/metrics`
- returns:

```json
{
  "<metric 1>": "<dict: dictionary with information e.g. homepage, version, type, ...>",
  "<metric 2>": "<dict: dictionary with information e.g. homepage, version, type, ...>"
}
```

**get information about all available summarizers**:

- method: GET
- location: `http://<domain>:<port>/api/summarizers`
- returns:

```json
{
  "<summarizer 1>": "<dict: dictionary with information e.g. homepage, version, type, ...>",
  "<summarizer 2>": "<dict: dictionary with information e.g. homepage, version, type, ...>"
}
```

**evaluation request**:

- method: POST
- location: `http://<domain>:<port>/api/evaluate`
- payload (hypotheses and references have to have same length):

```json
{
  "metrics": "<list of strings: list of metrics (i.e. ['bleu', 'cider', ...])>",
  "hypotheses": "<list of strings: hypotheses for evaluation>",
  "references": "<list of strings: references for evaluation>"
}
```

- returns:

```json
{
    "scores": {
        "<metric 1>": "<float or dictionary of subscores>",
        "<metric 2>": "<float or dictionary of subscores>"
    }
}
```

**summary request**:

- method: POST
- location: `http://<domain>:<port>/api/summarize`
- payload:

```json
{
  "text": "<string: text of which the summary has to be generated or url where the text is found>",
  "summarizers": "<list of strings: list of summarizers (i.e. ['t5', 'textrank', ...])>",
  "ratio": "<number: between 0 and 1, controls summary length>"
}
```

- returns:

```json
{
    "original": {
        "text": "<list of sentences: original text from which the summaries where generated>",
        "title": "<(only if url was used) string: title of the article"
    },
    "summaries": {
        "<summarizer 1>": "<list of sentences>",
        "<summarizer 2>": "<list of sentences>"
    }
}
```

# Used Metrics, Summarizers and Implementations

# Metrics

| metric                | source                                                                          | model                              |
| --------------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| BERTScore             | [Tiiiger/bert_score](https://github.com/Tiiiger/bert_score)                     | roberta-large-mnli                 |
| BLEU                  | [mjpost/sacreBLEU](https://github.com/mjpost/sacreBLEU)                         |                                    |
| BLEURT                | [google-research/bleurt](https://github.com/google-research/bleurt)             | bleurt-base-128                    |
| CIDEr                 | [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)                         |                                    |
| Cosine Similarity     | [explosion/spaCy](https://github.com/explosion/spaCy)                           | en_core_web_lg                     |
| METEOR                | [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)                         |                                    |
| Greedy Matching       | [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)                         | glove.6B.300d                      |
| MoverScore            | [AIPHES/emnlp19-moverscore](https://github.com/AIPHES/emnlp19-moverscore)       | distilbert-base-uncased            |
| ROUGE                 | [pltrdy/rouge](https://github.com/pltrdy/rouge)                                 |                                    |
| Sentence Transformers | [UKPLab/sentence-transformers](https://github.com/UKPLab/sentence-transformers) | roberta-large-nli-stsb-mean-tokens |

# Summarizers

| summarizer     | source                                                          | model                                                                  |
| -------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| BERTSummarizer |                                                                 | distilbert-base-uncased                                                |
| neuralsum      |                                                                 | T5, BART-CNN, BART-XSum, Pegasus-CNN, Pegasus-XSum, Longformer2Roberta |
| Newspaper3k    | [codelucas/newspaper/](https://github.com/codelucas/newspaper/) |                                                                        |
| TextRank       |                                                                 |                                                                        |

# Similar Projects

- [vizseq](https://github.com/facebookresearch/vizseq)
- [SummEval](https://github.com/Yale-LILY/SummEval)
