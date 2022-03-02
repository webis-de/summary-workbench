import subprocess

def setup():
    process = subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(process.stdout)
    print(process.stderr)

if __name__ == "__main__":
    setup()
    print("Model setup successfully.")


