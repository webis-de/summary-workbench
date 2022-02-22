# Description

Web project build with Flask, Express.js and React.js to assess and investigate the quality of summarization tasks.
You can evaluate the quality of your own summarizations or generate summarizations from texts or urls based on many metrics and summarizers.
A running demo can be found here: <https://tldr.demo.webis.de>.

# Configuration

## manage.py

The application can be customized with the [manage.py](manage.py) script (install required packages: `pip install -r requirements.txt`).  
The [manage.py](manage.py) has the following options:

| command            | description                                                   |
| ------------------ | ------------------------------------------------------------- |
| build              | build images for the plugins (metrics, summarizers)           |
| push               | push an image to dockerhub for later deployment               |
| gen-docker-compose | generate a docker-compose.yaml to run the application locally |
| gen-kubernetes     | generates kubernetes files for the deployment                 |

If you want to run the application locally, only `gen-docker-compose` is relevant for you (see [Development / run application locally](#development-run-application-locally)).

## Application config.yaml

The application is configured with the [config.yaml](config.yaml) file (specify a custom config with the option `--config <path>`).  
The [config.yaml](config.yaml) has the following options:

| option          | required for         | description                                                                  |
| --------------- | -------------------- | ---------------------------------------------------------------------------- |
| docker_username | push, gen-kubernetes | username of your dockerhub                                                   |
| deploy          | gen-kubernetes       | generate deployment files                                                    |
| metrics         | all                  | list of metrics (path or git url to the metric folder or repository)         |
| summarizers     | all                  | list of summarizers (path or git url to the summarizer folder or repository) |

Suboptions for `deploy`:

| option | description                                                                   |
| ------ | ----------------------------------------------------------------------------- |
| host   | address where the application gets deployed (e.g. https://tldr.demo.webis.de) |

Suboptions for `metrics` and `summarizers`:

| option      | description                                                                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| source      | path or git url to the plugin folder or repository                                                                                                                                                                                                                                    |
| image_url   | specify an url to an docker image in dockerhub want to use a existing image                                                                                                                                                                                                           |
| environment | Key-value pairs that will be add to the plugin as environment varaible during build time and are present in the running plugin container. It is usefull e.g. when a plugin provides different models and one wants to choose a model. (see [Write a Plugin](#write-a-plugin) Section) |

# Write a Plugin

This section explains how you can write your own metrics or summarizers to integrate with tldr.
Checkout [Application Config.yaml](#application-configyaml) on how to integrate your plugin in the application.
A plugin is a folder or git repository which contains the following files:

| file                                                       | required                                 | description                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| config.yaml                                                | yes                                      | see [plugin config.yaml](#plugin-configyaml)                                                                                                                                                                                                                                                                                                                                   |
| Dockerfile                                                 | if config.yaml contains no `deployimage` | used for building the deployment image                                                                                                                                                                                                                                                                                                                                         |
| Dockerfile.dev                                             | if config.yaml contains no `devimage`    | used for building the development image                                                                                                                                                                                                                                                                                                                                        |
| metric.py, metric folder, summarizer.py, summarizer folder | yes (one)                                | metric.py or metric folder for metric plugin (see [Metric](#metric)), summarizer.py or summarizer folder for summarizer plugin (see [Summarizer](#summarizer))                                                                                                                                                                                                                 |
| model_setup.py                                             | yes                                      | Is used to setup your application (i.e. download models). Leave it empty if no external data is needed. The file is required to remind the plugin creator that external data should be stored locally. All plugins can run without writing anything into this file but this can lead to performance issues (i.e. the models are downloaded on every restart of the container). |
| Pipfile.lock, Pipfile, requirements.txt                    | yes (one)                                | contains the packages required by your application                                                                                                                                                                                                                                                                                                                             |

## Plugin config.yaml

Following Options can be specified in the `config.yaml`:

| option      | required                          | description                                                                                                                                                                                                                    |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| version     | yes                               | version string of the plugin                                                                                                                                                                                                   |
| name        | yes                               | name of the plugin (e.g. BERTScore)                                                                                                                                                                                            |
| metadata    | no                                | Dictionary with extra data that is available to the container during build time and when running. This data is also returned when quering for available Metrics/Summrizers. Metadata we use: type, model, homepage, sourcecode |
| devimage    | if Dockerfile.dev is not provided | available images can be found under `images/dev/` (i.e. default, slim, java)                                                                                                                                                   |
| deployimage | if Dockerfile is not provided     | available images can be found under `images/deploy/` (i.e. default, slim, java)                                                                                                                                                |

Everything under `/root` in the container is stored in a volume.  
If you have extra data it should be stored there.

## Metric

For some examples checkout the [metrics](metrics) folder.
The metric.py file should have a class `MetricPlugin` with the following methods:

- evaluate(self, hypotheses, references)
  - hypotheses: list of strings
  - references: list of strings
  - len(hypotheses) is equal to len(references)
  - returns: a number/score or a dictionary, which contains the computed scores (e.g. {"1": 0.1, "l": 0.1}). in the frontend the entries of the dictionary will be combined with the name of the plugin e.g. when the name is `rouge`, the example becomes {"rouge 1": 0.1, "rouge l": 0.1}

## Summarizer

For some examples checkout the [summarizers](summarizers) folder.
The summarizer.py file should have a class `SummarizerPlugin` with the following methods:

- summarize(self, text, ratio)
  - text: string from which the summary is to be generated
  - ratio: number between 0 and 1 which can be used to control the length of the summary
  - returns: a string or a list of sentences which is the generated summary

### Example
Let us add the ConcluGen model (for generating informative conclusions of arguments) as a plugin.
**Method 1. From a local folder.**
1. Under `summarizers`, create a new directory named `conclugen`
2. This directory must contain the four files mentioned above:   `requirements.txt`, `model_setup.py`, `summarizer.py`, and `config.yaml`. 
   
Contents of `requirements.txt`
```
requests
transformers[torch]
```
Download and save model checkpoints in the `model_setup.py`

```
URL = "https://files.webis.de/webis-conclugen21-models/dbart.tar.gz"
SAVE_PATH = "checkpoints"

def setup():
    # create checkpoints directory if non-existent
    print("Creating and downloading checkpoints")
    pathlib.Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
    response = requests.get(URL, stream=True)
    file = tarfile.open(fileobj=response.raw, mode="r|gz")
    file.extractall(path=SAVE_PATH)
    print("Done")

if __name__ =="__main__":
    setup()
```
Create the summarization pipeline in `summarizer.py`. This file declares a `SummarizerPlugin()` that implements the `summarize()` method.
```
from transformers import AutoModelForSeq2SeqLM, pipeline, AutoTokenizer

class ConcluGen():
  def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(pathlib.Path(MODEL_NAME), local_files_only=True)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(pathlib.Path(MODEL_NAME), local_files_only=True)
        self.pipeline = pipeline(
            "summarization", model=self.model, tokenizer=self.tokenizer
        )
  
  def generate_conclusion(self, text, ratio):
    return "Conclusion"

class SummarizerPlugin():
  def __init__(self):
    self.summarizer = ConcluGen()
  
  def summarize(self, *args, **kwargs):
    return self.summarizer.generate_conclusion(*args, **kwargs)
```
Provide model details and metadata for the web interface via the local `config.yaml` file.

```version: "1.0"
name: "ConcluGen"
devimage: slim
deployimage: slim
metadata:
  type: abstractive
  homepage: https://aclanthology.org/2021.findings-acl.306/
  sourcecode: https://github.com/webis-de/acl21-informative-conclusion-generation
```

**Method 2. From a git repository.**
TBD

Regenerate docker compose file via `python manage.py gen-docker-compose` and redeploy the app.

```
docker-compose down --remove-orphans
docker-compose up .
```

The new plugin should now be available for inference via the web interface.




# Development / run application locally

**requirements**: install docker and docker-compose on your system and make sure the docker service is running (`sudo systemctl start docker.service`)

Generate a docker-compose file for the local development of the application with `./manage.py gen-docker-compose`.

Comment out the services which you don't need in `config.yaml` to prevent unnecessary RAM usage.

Run `docker-compose up .`

**Note**: This step takes a while to finish if running for the first time as it builds individual docker images for each summarization model and evaluation metric.

The application can be accessed via `localhost:3000`

The `api` and `frontend` containers are available even before the other containers are done initializing.
Some parts of the applications will only become available over time, because they are busy downloading a model.

# Deployment on Kubernetes

`./manage.py gen-kubernetes` will generate the kubernetes service files and store them under `deploy/`.
Before deploying you need to build the necessary images and push them to dockerhub with `./manage.py build` and `./manage.py push`.

# Api Documentation

The api documentation can be found under `/api/doc` (e.g. <https://tldr.demo.webis.de/api/doc>).  
The script [tldr.py](tldr.py) can be used to access the application from the commandline.
It can also be imported in python files to build applications based on the application.

# Builtin Metrics and Summarizers

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
