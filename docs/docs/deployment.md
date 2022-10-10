---
title: Deployment
sidebar_position: 4
---

The deployment of the application is not generic and is tailored to our custom Kubernetes cluster.

1. Add the following to your plugin `sw-config.yaml`:

```yaml title=sw-config.yaml
docker_username: <your-dockerhub-username>
deploy:
  host: <host-where-the-application-is-exposed>
  resources: # this option can be omitted
    requests:
      cpu: "500m"
    limits:
      cpu: "4000m"
```

:::note

The `resources` field is exactly like described in <https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/>.  
It is used to limit the deployed containers.

:::

2. Login to your Dockerhub account.
3. Build the necessary images and push them to dockerhub with `./configure.py build --all` and `./configure.py push --all`.
4. Run `./configure.py gen-kubernetes` to generate the deployment files under `deploy/`.
5. Use `kubectl` to deploy the application (e.g. `kubectl apply -f`).
