# Description

Web project build with Flask and React for computing metrics between 2 files containing hypotheses and references.

# Setup

**requirements**: install docker and docker-compose on your system and make sure
the docker service is running (`sudo systemctl start docker.service`)  
**note**: following instructions assume the repository is in the home folder and named `comparefile`

`cd ~/comparefile/ && docker-compose up -d`

the following containers should be running:

    - comparefile_frontend_1
    - comparefile_backend_1

**note**: The setup takes about 15 minutes for downloading necessary packages and models.
The process can be montitored by typing `cd ~/comparefile/ && docker-compose logs -f`.
The application can be terminated by `cd ~/comparefile/ && docker-compose down`.
A later restart of the container wont take long because the models and packages are stored.

the application can be accessed via `localhost:3000`

# Configuration and Updates

Packages get checked and updated on every startup of the backend container. This takes some time and is useless, when you know that nothing has changed.
You can disable this behavior by setting the environment variable `INSTALL_ALWAYS="no"`. This can be configured by `echo INSTALL_ALWAYS="no" > ~/comparefile/.env`  
Sometimes a quick fix for a Problem might be to delete the `comparefile_virtualenvs` volume (`docker volume rm comparefile_virtualenvs`) and restart the application.

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

