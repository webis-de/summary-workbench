---
title: Configuration
sidebar_position: 2
---

## configure.py

The root of the repository contains a `configure.py` script, which is used to:

- generate a docker-compose file
- generate deployment files for kubernetes
- build images
- pushing image to dockerhub.

Before you can use the `configure.py` script you need to run `pip install -r requirements.txt` in the project root, to install all necessary dependencies.

Following commands are available:

| command            | description                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| gen-docker-compose | generate a docker-compose.yaml to run the application locally                                                                      |
| build              | build images for the plugins (metrics, summarizers)                                                                                |
| push               | push an image to dockerhub for later deployment                                                                                    |
| gen-kubernetes     | generates kubernetes files for the deployment                                                                                      |
| gen-schema         | generate json schema files for sw-config.yaml and sw-plugin-config.yaml which can be used to provide completion in your editor/IDE |

## sw-config.yaml

The application is configured with the `sw-config.yaml` file.
It has the following top level options:

| option          | required for         | description                                                                  |
| --------------- | -------------------- | ---------------------------------------------------------------------------- |
| docker_username | push, gen-kubernetes | username of your dockerhub                                                   |
| deploy          | gen-kubernetes       | generate deployment files                                                    |
| metrics         | all                  | list of metrics (path or git url to the metric folder or repository)         |
| summarizers     | all                  | list of summarizers (path or git url to the summarizer folder or repository) |

To configure a metric or a summarizer specify the path or git url to the metric or to the summarizer as an list entry under the `metrics` or `summarizers` option.
Alternatively you can specify the following options as dictionary:

| option      | description                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| source      | path or git url to the plugin folder or repository                                                                                                                                                                                    |
| disabled    | if true, the plugin will not be loaded but information about the plugin will still be shown in the application                                                                                                                        |
| environment | key-value pairs that will be add to the plugin as environment variables during build time and are present in the running plugin container. It is useful e.g. when a plugin provides different models and one wants to choose a model. |

:::info

The default application configuration file is `sw-config.yaml` which can be found in the project root. To use a different file specify the path to the file via the `--config` option to the `configure.py` script.

:::

### Completion

You are advised to run `./configure.py gen-schema` to generate the json schemas which can provide completion for IDE when you edit the configuration files.
The generated files are located under `schema/` in the repository.

To enable completion in VSCode, you need to install the [yaml extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) and add the following lines to your [`settings.json`](https://code.visualstudio.com/docs/getstarted/settings#_settingsjson) file:

```json
{
  "yaml.schemas": {
    "<path to repository>/schema/sw-config.schema.json": "*sw-config.yaml",
    "<path to repository>/schema/sw-plugin-config.schema.json": "sw-plugin-config.yaml"
  }
}
```

Don't forget to replace `<path to repository>` with the path to the repository on your system.
If the repository is located under `/home/me/summary-workbench` than `<path to repository>/schema/sw-config.schema.json` becomes `/home/me/summary-workbench/schema/sw-config.schema.json`
