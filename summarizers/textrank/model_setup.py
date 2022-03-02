import subprocess
import os

def setup():
    process = subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

if __name__ == "__main__":
    setup()


