# Description

Web project build with Flask and React for computing metrics between 2 files containing hypotheses and references.

# Development
## Setup

**requirements**: install docker and docker-compose on your system and make sure
the docker service is running (`sudo systemctl start docker.service`)  
**note**: following instructions assume the repository is in the home folder and named `comparefile`

`cd ~/comparefile/ && docker-compose up -d`

the following containers should be running:

    - comparefile_frontend_1
    - comparefile_backend_1

**note**: The setup takes about 15 minutes for downloading necessary packages and models.
The process can be monitored by typing `cd ~/comparefile/ && docker-compose logs -f`.
The application can be terminated by `cd ~/comparefile/ && docker-compose down`.
A later restart of the container wont take long because the models and packages are stored.

The application can be accessed via `localhost:3000`.  
If the containers are not launched on `localhost`, you have to specify the address in the `.env` file: `echo API_HOST=<your-host> >> ~/comparefile/.env`.  
You can also change the port by `echo API_PORT=<your-port> >> ~/comparefile/.env`.

## Configuration and Updates

Packages get checked and updated on every startup of the backend container. This takes some time and is useless, when you know that nothing has changed.
You can disable this behavior by setting the environment variable `INSTALL_ALWAYS="no"`. This can be configured by `echo INSTALL_ALWAYS="no" >> ~/comparefile/.env`  

# Production
## Local
Use the docker-compose-production.yaml (`cd ~/comparefile/ && docker-compose -f docker-compose-production.yaml up -d`) to run a optimized build of the application.
It uses port 80.
It can be accessed via `http://<your-host>`.

## Deployment on Kubernetes
The deployment files can be found under `~/comparefile/deploy/`.
Before deploying you need to build the necessary images and push them to a registry like dockerhub.
Following images exist:

    - backend: `docker build -t <your-name>/comparefile-backend:<version> ~/comparefile/backend`
    - frontend: `docker build -t <your-name>/comparefile-frontend:<version> ~/comparefile/frontend`
    - wait-for-it: `docker build -t <your-name>/wait-for-it:<version> ~/comparefile/wait-for-it`

Build the images and push them to your registry.  
Before running the following command you need to change the images in the files that can be found in `~/comparefile/deploy/services/` to your build images.  
This is straight forward. Just search for `comparefile-backend`, `comparefile-frontend`, `wait-for-it` and change the links.  
Run `kubectl apply -f ~/comparefile/deploy/volumes.yaml` to initialize the volumes.  
Run `kubectl apply -f ~/comparefile/deploy/services/` to initialize the rest of the application.  

Following services exist:

    - backend
    - frontend
    - proxy
    - mongodb

Normally you only start the proxy and mongodb services only once and don't change them in the future.
When you want to update the application you need to run `kubectl apply -f ~/comparefile/deploy/services/backend.yaml` or `kubectl apply -f ~/comparefile/deploy/services/frontend.yaml`.
Don't forget to rebuild and push the backend and frontend image and change the image tags in the corresponding files.
You never need to rebuild the `wait-for-it` image. It is only used to check if the services are initialize.

# Used Metrics and Implementations
- BERT: [Tiiiger/bert_score](https://github.com/Tiiiger/bert_score) (**model**: roberta-large-mnli)
- BLEU: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- CIDEr: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- METEOR: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- MoverScore: [AIPHES/emnlp19-moverscore](https://github.com/AIPHES/emnlp19-moverscore) (**model**: distilbert-base-uncased)
- greedy matching: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval) (**model**: glove.6B.300d)
- ROUGE: [pltrdy/rouge](https://github.com/pltrdy/rouge)

# Similar Projects
- [vizseq](https://github.com/facebookresearch/vizseq)

