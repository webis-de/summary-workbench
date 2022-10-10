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

| option   | required | description                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version  | yes      | version string of the plugin (start with `"1.0"` and increment if you make changes) make sure the version is a string and not a float (e.g. `"1.0"` instead of `1.0`)                                                                                                                                                                                                                                                                                                     |
| name     | yes      | name of the plugin (e.g. `BERTScore`)                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| metadata | no       | Dictionary with extra data that is available to the container during build time and when running. This data is also returned when querying for available metrics/summarizers. Metadata we use to display information about the plugin in the frontend are `type` (extractive/abstractive/semantic/lexical), `model` (configured deep learning model), `homepage` (url to homepage, developer of plugin or paper) and `sourcecode` (url to plugin or used implementation). |

### Completion

Follow the steps under [configuration#completion](/configuration#completion) to setup completion.

## Metric plugin specific configuration

The `metric.py` file should have a class `MetricPlugin` with the following methods:

```python
from typing import List, Tuple

class MetricPlugin:
    def evaluate(self, batch: List[Tuple[str, str]]) -> List[float]:
        hypotheses, references = zip(*batch)
        # your code
        return scores
```

The `batch` argument contains hypotheses-reference pairs.
For each pairs one score has to be computed and returned as a list where the order corresponds to the order of the pairs in the batch.

## Summarizer plugin specific configuration

The `summarizer.py` file should have a class `SummarizerPlugin` with the following methods:

```python
from typing import List, Union

class SummarizerPlugin:
    def summarize(self, batch: List[str], ratio: float) -> Union[List[str], List[List[str]]]:
        # your code
        return summaries
```

The `batch` argument contains texts that have to be summarized and the ratio is a number between 0 and 1 that specifies the desired length of the summary with respect to the length of the source text.
Summaries can be either a string or a list of sentences.

## Important remarks

The `THREADS` environment variable as described in [setup_quickstart#extern-environment](setup_quickstart#extern-environment) configures the number of parallel calls to the `evaluate` and `summarize` function.
Make sure that your function is threads safe by using `threading.Lock` if necessary.

## Required arguments

The `batch` argument for both plugin types and the `ratio` argument for the summarizer plugin can not be called different because they are passed as keyword arguments.
In general type annotations should be omitted for the required arguments but they can be added if they have the annotated type is correct.

## Extra arguments

You can define your own arguments simply by adding them to the function definition:

```python
from typing import List, Union, Literal
from pydantic import Field

class SummarizerPlugin:
    def summarize(
      self,
      batch,
      ratio,
      argument1: bool,
      argument2: Literal[1, 2, 3] = 2,
      argument3: int = Field(..., ge=0, le=10),
    ) -> Union[List[str], List[List[str]]]:
        # your code
        return summaries
```

The `Field` attribute from [pydantic](https://pydantic-docs.helpmanual.io/) can be used to define extra constrains for the arguments.
In the example `argument1` is a Boolean argument without a default value, `argument2` is a categorical argument with 3 types and `2` as the default argument and `argument3` is an integer argument with no default argument that has to be at least 0 and at most 10.

:::info

A pydantic model is build to evaluate the function arguments before passing them to the function.
Therefore it is not necessary to check if the arguments are valid.
The pydantic model is converted into json-schema and passed to the frontend to generate the form to input argument values.
The form generator currently supports Boolean, categorical, integer, float and string arguments.

:::

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

## Dynamic Metadata

Metadata can be specified using the `metadata` field in the `sw-plugin-config.yaml`.
This approach is static and sometimes it is required to set the metadata based on some parameter.
For example with the following config it could be useful to expose the model as a metadata field.

```yaml title="example sw-config.yaml"
summarizers:
  - source: <path-to-cool-summarizer>
    environment:
      model: cool model
```

This is possible by adding a metadata method to the corresponding Plugin class, which returns a dictionary containing the metadata.

```python title="example summarizer plugin (works the same for metric plugin)"
class SummarizerPlugin:
    def __init__(self):
        self.m = {"model": os.environ.get("model")}

    def summarize(self, batch, ratio):
        return ["example summary"] * len(batch)

    def metadata(self):
        return self.m
```

:::note

The dynamic metadata returned from the metadata method will overwrite the static metadata specified in the `sw-plugin-config.yaml` file.

:::

## Tips

- Writing a simple plugin is very easy and you probably need only very few information from this page.  
  Most of the time copying an existing plugin from `metrics/` or `summarizer/` and sticking to its structure will help to get started.

- Everything under `/root` (the home folder) in the container is stored in a volume.  
  If you need external data, it should be stored there.  
  Additionally it is advised to store downloaded files (e.g. models) in `~/.cache` which will be expanded to `/root/.cache` in the container (don't forget to use `os.path.expanduser` or `pathlib.Path.expanduser`).

- You are advised to use a `Pipfile` or `Pipfile.lock` instead of a `requirements.txt`, because it allows you to specify a python version.
  The base image for the container will be the official docker image for the specified python version.  
  The only alternative to specify a custom python version is to provide your own Dockerfile.

- If your plugin is generic and can have multiple models, only download the specified model.
