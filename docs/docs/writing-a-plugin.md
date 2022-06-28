---
title: Writing a Plugin
sidebar_position: 3
---

This section explains how you can write your own metrics or summarizers to integrate with Summary Workbench.
To help you get started, take a look at the predefined plugins located in the `metrics/` and `summarizers/` folders.

## Plugin folder structure

A plugin is a folder or git repository which contains the following files:

| file                                                       | required  | description                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| sw-plugin-config.yaml                                      | yes       | see [sw-plugin-config.yaml](#sw-plugin-configyaml)                                                                                                                                                                                                                                                                                                                             |
| Dockerfile                                                 | no        | if not specified, `docker/Dockerfile.plugin` will be used which can be found under the repository root                                                                                                                                                                                                                                                                         |
| metric.py, metric folder, summarizer.py, summarizer folder | yes (one) | metric.py or metric folder for metric plugin, summarizer.py or summarizer folder for summarizer plugin                                                                                                                                                                                                                                                                         |
| model_setup.py                                             | yes       | Is used to setup your application (i.e. download models). Leave it empty if no external data is needed. The file is required to remind the plugin creator that external data should be stored locally. All plugins can run without writing anything into this file but this can lead to performance issues (i.e. the models are downloaded on every restart of the container). |
| Pipfile.lock, Pipfile, requirements.txt                    | yes (one) | contains the packages required by your application                                                                                                                                                                                                                                                                                                                             |

## sw-plugin-config.yaml

Following Options can be specified in the `sw-plugin-config.yaml` file:

| option    | required | description                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version   | yes      | version string of the plugin (start with `"1.0"` and increment if you make changes) make sure the version is a string and not a float (e.g. `"1.0"` instead of `1.0`)                                                                                                                                                                                                                                                                                                     |
| name      | yes      | name of the plugin (e.g. `BERTScore`)                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| metadata  | no       | Dictionary with extra data that is available to the container during build time and when running. This data is also returned when querying for available metrics/summarizers. Metadata we use to display information about the plugin in the frontend are `type` (extractive/abstractive/semantic/lexical), `model` (configured deep learning model), `homepage` (url to homepage, developer of plugin or paper) and `sourcecode` (url to plugin or used implementation). |
| arguments | no       | see [Arguments](#arguments)                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Arguments

Arguments are extra keyword arguments for your plugin (e.g. for `evaluate`, `summarize`).
You can specify the following argument types:

- `str` (text)
- `int` (integer)
- `float` (float)
- `bool` (boolean)
- `categorical` (categorical)

All types can take an optional `default` option.  
The `categorical` argument takes a `categories` options, which is a list of categories.  
The `int` and `float` can take optional `min` and `max` options.

```yaml title="example sw-config.yaml with configured arguments"
version: "1.0"
name: Test
arguments:
  title:
    type: str
    default: "" # this allows empty input
  use_tfidf:
    type: bool
    default: true
  probability:
    type: float
    min: 0
    max: 1
  fruit:
    type: categorical
    categories:
      - apple
      - banana
    default: apple
```

### Completion

Follow the steps under [configuration#completion](/configuration#completion) to setup completion.

## Metric plugin specific configuration

The `metric.py` file should have a class `MetricPlugin` with the following methods:

```python
from typing import List, Dict, Union

class MetricPlugin:
    def evaluate(self, hypotheses: List[str], references: List[str]) -> Union[List[float], Dict[str, List[float]]]:
        pass # your code
```

:::note

The length of the `hypotheses` list is always equal to the length of the `references` list.  
The entries of `hypotheses` and `references` correspond index-wise, e.g. `hypotheses[0]` has to be evaluated with `references[0]`, `hypotheses[1]` has to be evaluated with `references[1]`, ...

:::

:::note

The scores have to be returned as a list.  
When `evaluate` returns a dictionary (e.g. `{"1": [0.1], "l": [0.1]}`), the entries of the dictionary will be combined with the name of the plugin e.g. when the name is `ROUGE`, the example becomes `{"ROUGE 1": [0.1], "ROUGE l": [0.1]}`.

:::

:::note

All arguments to the evaluate method will be passed as keyword arguments. You can also configure extra arguments (see [Arguments](#arguments))

:::

## Summarizer plugin specific configuration

The `summarizer.py` file should have a class `SummarizerPlugin` with the following methods:

```python
from typing import List, Union

class SummarizerPlugin:
    def summarize(self, text: str, ratio: float) -> Union[str, List[str]]:
        pass # your code
```

:::note

`text` is a string from which the summary needs to be generated.  
`ratio` is a number between 0 and 1 and specifies the length of the summary with respect to the length `text`.

:::

:::note

The returned value is either the summary as a string or a list of the sentences of the summary.

:::

:::note

All arguments to the evaluate method will be passed as keyword arguments. You can also configure extra arguments (see [Arguments](#arguments))

:::

## Example summarizer plugin

Let us add the ConcluGen model (for generating informative conclusions of arguments) as a plugin.

### Method 1. From a local folder.

1. Create a folder anywhere and name it `conclugen`.
2. This folder must contain the four files mentioned above: `requirements.txt`, `model_setup.py`, `summarizer.py`, and `config.yaml`.

```requirements.txt title="requirements.txt"
requests
transformers[torch]
```

```python title=model_setup.py
import requests
import tarfile
import pathlib

SAVE_PATH = pathlib.Path("~/checkpoints").expanduser()
URL = "https://files.webis.de/webis-conclugen21-models/dbart.tar.gz"
MODEL_NAME = "Webis-Conclugen21"

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

```python title=summarizer.py
import pathlib

import transformers
from model_setup import SAVE_PATH
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline

MODEL_PATH = SAVE_PATH / "dbart"


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

  def summarize(self, **kwargs):
    return self.summarizer.generate_conclusion(**kwargs)
```

```yaml title=sw-plugin-config.yaml
version: "1.0"
name: "ConcluGen"
metadata:
  type: abstractive
  homepage: https://aclanthology.org/2021.findings-acl.306/
  sourcecode: https://github.com/webis-de/acl21-informative-conclusion-generation
```

To configure the plugin add the following to your `sw-config.yaml`:

```yaml title=sw-config.yaml
summarizers:
  - <path to your conclugen folder>
```

### Method 2. From a git repository.

Do the same as in [Method 1. From a local folder.](#method-1-from-a-local-folder) and push the folder to GitHub (name the repository `conclugen`).

To configure the plugin add the following to your `sw-config.yaml`:

```yaml title=sw-config.yaml
summarizers:
  - https://github.com/<your-username>/conclugen
```

## Generic plugins

Sometimes you want to have a generic plugin (a plugin that can take different models).  
In that case you can specify the model by providing it as an environment variable via the `environment` key in the `sw-config.yaml`
You can also add environment variable values to the name of the plugin by using format strings.

```yaml title="example sw-plugin-config.yaml"
version: "1.0"
name: "CoolSummarizer ({model})"
```

```yaml title="example sw-config.yaml"
summarizers:
  - source: <path-to-cool-summarizer>
    environment:
      model: cool model
```

This will configure the plugin as `CoolSummarizer (cool model)` and inside the container `os.environ["model"]` will be `cool model`

For examples checkout `summarizer/neuralsum`, `summarizer/cliffsum`, and `summarizer/coopsum`

## Tips

- Writing a simple plugin is very easy and you probably need only very few information from this page.  
  Most of the time copying an existing plugin from `metrics/` or `summarizer/` and sticking to its structure will help to get started.

- Everything under `/root` in the container is stored in a volume.  
  If you need external data, it should be stored there.  
  Additionally it is advised to store downloaded files (e.g. models) in `~/.cache` which will be expanded to `/root/.cache` in the container (don't forget to use `os.path.expanduser` or `pathlib.Path.expanduser`).

- You are advised to use a `Pipfile` or `Pipfile.lock` instead of a `requirements.txt`, because it allows you to specify a python version.
  The base image for the container will be the official docker image for the specified python version.  
  The only alternative to specify a custom python version is to provide your own Dockerfile.

- If your plugin is generic, only download the specified model.
