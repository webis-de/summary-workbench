# Description

Web project build with Flask and React to assess and investigate the quality of summarization tasks.

# Development
## Setup

**requirements**: install docker and docker-compose on your system and make sure
the docker service is running (`sudo systemctl start docker.service`)  
**note**: following instructions assume the repository is in the home folder and named `comparefile`

You need to use the `gen-docker-compose.py` to generate the docker-compose.yaml file.
Before using it, you need to install the package ruamel.yaml (`pip install ruamel.yaml`).
The script uses `full-docker-compose.yaml` and `dev-config.yaml` for the generation.
Specify the services that you want to enable in the `dev-config.yaml` file.
You can check the `full-docker-compose.yaml` file for all available services.
The available services should already be listed in the `dev-config.yaml`.
This is necessary since the full application uses more than 16GB of Memory.

Following instruction starts the application.
`cd ~/comparefile/ && docker-compose up -d`

**note**: The setup takes about 15 minutes for downloading necessary packages and models.
The process can be monitored by typing `cd ~/comparefile/ && docker-compose logs -f`.
The application can be terminated by `cd ~/comparefile/ && docker-compose down`.
A later restart of the container wont take long because the models and packages are stored.

The application can be accessed via `localhost:3000`.  
If the containers are not launched on `localhost`, you have to specify the address in the `.env` file: `echo API_HOST=<your-host> >> ~/comparefile/.env`.  
You can also change the port by `echo API_PORT=<your-port> >> ~/comparefile/.env`.

The `api` and `frontend` containers are available even before the other containers are done initializing.
Therefore some parts of the applications will only become available over time.
If you worry about the status of the application run `docker-compose ps`.
If there is no service with state `Exited`, than everything should be fine.

# Production
## Deployment on Kubernetes
The deployment files can be found under `~/comparefile/deploy/`.
Before deploying you need to build the necessary images and push them to a registry like dockerhub.

Before running the following command you need to change the images in the files that can be found in `~/comparefile/deploy/services/` to your build images.  
Run `kubectl apply -f ~/comparefile/deploy/volumes.yaml` to initialize the volumes.  
Run `kubectl apply -f ~/comparefile/deploy/services/` to initialize the rest of the application.  

When you want to update the application you need to run `kubectl apply -f ~/comparefile/deploy/services/<service>.yaml`.

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
