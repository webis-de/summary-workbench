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

When pulling a new version it might be necessary to delete the `comparefile_virtualenvs` volume (`docker volume rm comparefile_virtualenvs`),
so new Packages get installed. By default packages get only installed if the virtualenv doesn't already exist to speed up the startup process.
Alternatively, the installation on every startup of the docker container can be forced by setting the environment variable `INSTALL_ALWAYS="yes"`.
This can be configured by `echo INSTALL_ALWAYS="yes" > ~/comparefile/.env`

# Used Metrics and Implementations
- rouge: [pltrdy/rouge](https://github.com/pltrdy/rouge)
- BERT: [Huffon/sentence-similarity](https://github.com/Huffon/sentence-similarity)
- BLEU: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- CIDEr: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- METEOR: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)
- MoverScore: [AIPHES/emnlp19-moverscore](https://github.com/AIPHES/emnlp19-moverscore)
- greedy matching: [Maluuba/nlg-eval](https://github.com/Maluuba/nlg-eval)

# Similar Projects
- [vizseq](https://github.com/facebookresearch/vizseq)

