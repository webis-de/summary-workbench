const { spawn } = require("child_process");
const FormData = require("form-data");
const net = require("net");
const axios = require("axios");

const { PORT } = require("./config");

const portUsed = (port) =>
  new Promise((resolve) => {
    const client = net.connect({ port, host: "localhost" });
    client.on("connect", () => {
      client.destroy();
      resolve(true);
    });
    client.on("error", () => resolve(false));
  });

const getServer = (port) => {
  const srv = net.createServer();
  srv.listen(port);
  return srv;
};

const getFreePorts = async (count) => {
  let dummyServer = null;
  if (!(await portUsed(PORT))) dummyServer = getServer(PORT);
  const servers = [...Array(count)].map(() => getServer(0));
  const ports = servers.map((server) => server.address().port);
  if (dummyServer) dummyServer.close();
  servers.forEach((server) => server.close());
  return ports;
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

class Subservice {
  constructor(command, verbose = false) {
    this.command = command;
    this.verbose = verbose;
  }

  init(port) {
    this.process = spawn(this.command, [port]);
    if (this.verbose) {
      this.process.stdout.pipe(process.stdout);
      this.process.stderr.pipe(process.stdout);
    }
    this.port = port;
    this.running = true;
    this.process.on("exit", () => {
      this.running = false;
    });
    console.log(`${this.constructor.name}: listening on port ${port}`);
  }

  async wait() {
    console.log(`${this.constructor.name}: waiting`);
    while (!(await portUsed(this.port)) && this.running) await sleep(1000);
    if (!this.running) {
      console.log(this.running);
      throw new Error(`${this.constructor.name}: process exited`);
    }
    console.log(`${this.constructor.name}: waiting done`);
  }
}

class ArticleDownloader extends Subservice {
  constructor(verbose = false) {
    super("subservices/download_article.py", verbose);
  }

  download(url) {
    return axios.post(`http://localhost:${this.port}/`, { url }).then((response) => response.data);
  }
}

class SentenceSplitter extends Subservice {
  constructor(verbose = false) {
    super("subservices/sentence_split.py", verbose);
  }

  split(text) {
    return axios
      .post(`http://localhost:${this.port}/`, { text })
      .then((response) => response.data.sentences);
  }
}

class PdfExtractor extends Subservice {
  constructor(verbose = false) {
    super("subservices/pdf_extractor.py", verbose);
  }

  extract(pdf) {
    const formData = new FormData();
    formData.append("file", pdf, "file.pdf");
    return axios
      .post(`http://localhost:${this.port}/`, formData, {
        headers: formData.getHeaders(),
      })
      .then((response) => response.data);
  }
}

const articleDownloader = new ArticleDownloader();
const sentenceSplitter = new SentenceSplitter();
const pdfExtractor = new PdfExtractor();

const services = [articleDownloader, sentenceSplitter, pdfExtractor];

const initSubservices = async () => {
  const freePorts = await getFreePorts(services.length);
  freePorts.forEach((port, i) => services[i].init(port));
  await Promise.all(services.map((service) => service.wait()));
};

module.exports = {
  articleDownloader,
  sentenceSplitter,
  pdfExtractor,
  initSubservices,
};
