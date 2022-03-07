FROM nikolaik/python-nodejs:python3.9-nodejs16-slim
ENV PDF_EXTRACTOR_HOME=/pdf_extractor

RUN apt update && apt -y install openjdk-11-jdk git unzip curl

# pdf extractor setup
RUN mkdir $PDF_EXTRACTOR_HOME
RUN cd $PDF_EXTRACTOR_HOME && git clone https://github.com/allenai/s2orc-doc2json.git
RUN cd $PDF_EXTRACTOR_HOME && wget https://github.com/kermitt2/grobid/archive/0.6.1.zip && unzip 0.6.1.zip && rm 0.6.1.zip
RUN cd $PDF_EXTRACTOR_HOME/grobid-0.6.1 && ./gradlew clean install
RUN cp $PDF_EXTRACTOR_HOME/s2orc-doc2json/doc2json/grobid2json/grobid/config.yaml $PDF_EXTRACTOR_HOME/grobid-0.6.1/grobid-service/config/config.yaml && cp $PDF_EXTRACTOR_HOME/s2orc-doc2json/doc2json/grobid2json/grobid/grobid.properties $PDF_EXTRACTOR_HOME/grobid-0.6.1/grobid-home/config/grobid.properties

RUN pip3 install --no-cache-dir $PDF_EXTRACTOR_HOME/s2orc-doc2json newspaper3k nltk flask beautifulsoup4 boto3 aiohttp lxml python-multipart python-magic latex2mathml fastapi uvicorn

WORKDIR /app
COPY . /app/
RUN rm -f /app/plugin_config.json
RUN npm ci

CMD ./boot.sh


# vi: ft=dockerfile
