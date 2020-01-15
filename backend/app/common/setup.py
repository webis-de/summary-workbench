import os
from sys import stderr
import click

from app.common.constants import data_path, glove_bin


def download_file(url, save_path):
    import requests
    import logging
    from tqdm import tqdm

    chunk_size = 1 * 1024**2

    try:
        req = requests.get(url, stream=True)
        req.raise_for_status()

        length = req.headers.get('Content-length')
        if length is not None:
            total = int(length) // chunk_size + 1

        with open(save_path, 'wb') as f:
            progress_iter = tqdm(
                req.iter_content(chunk_size=chunk_size),
                total=total,
            )
            for chunk in progress_iter:
                f.write(chunk)

    except Exception:
        logging.exception("Error downloading file.")


@click.command(help="download necessary data")
def setup():
    from zipfile import ZipFile
    from gensim.models import KeyedVectors
    from gensim.scripts.glove2word2vec import glove2word2vec

    if not os.path.exists(data_path):
        try:
            os.makedirs(data_path)
        except FileExistsError:
            pass

    glove_path = os.path.join(data_path, glove_bin)

    import nltk
    nltk.download('punkt')

    if not os.path.exists(glove_path):
        print("downloading and installing glove-model (~10min)", file=stderr)
        zip_file = "glove.6B.zip"
        extract_file = "glove.6B.300d.txt"
        converted_file = "glove.6B.300d.model.txt"
        url = "http://nlp.stanford.edu/data/" + zip_file
        zip_path = os.path.join(data_path, zip_file)

        # download zip
        print("Downloading {} to {}.".format(url, zip_path), file=stderr)
        download_file(url, zip_path)

        # extract the relevant file
        print("Extracting {}".format(zip_file), file=stderr)
        with ZipFile(os.path.join(data_path, zip_file)) as z:
            z.extract(extract_file, data_path)

        glove_raw_path = os.path.join(data_path, extract_file)
        glove_converted_path = os.path.join(data_path, converted_file)

        # convert to gensim format
        print("{} -> {}".format(extract_file, converted_file), file=stderr)
        glove2word2vec(glove_raw_path, glove_converted_path)

        # convert to binary for fast loading
        print("{} -> {}".format(converted_file, glove_bin), file=stderr)
        m = KeyedVectors.load_word2vec_format(glove_converted_path)
        m.save(glove_path)

        cached_files = [
            zip_path,
            glove_raw_path,
            glove_converted_path,
        ]

        # remove cached files
        print("remove cached files")
        for file in cached_files:
            if os.path.exists(file):
                os.remove(file)
        print("done")
