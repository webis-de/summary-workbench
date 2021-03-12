const { spawn } = require("child_process");
const axios = require("axios")
var net = require('net');

const { PORT } = require("./config");

const port_used = (port) => new Promise(resolve => {
  const process = spawn("nc", ["-z", "localhost", port]);
  process.on("exit", (code) => resolve(code === 0))
})

const getServer = (port) => {
  const srv = net.createServer();
  srv.listen(port)
  return srv
}

const get_free_ports = (count) => {
  let dummyServer = null
  const servers = []
  if (!port_used(PORT)) {
    const dummyServer = getServer(PORT)
  }
  for (let i = 0; i < count; i++) {
    servers.push(getServer(0));
  }
  const ports = servers.map(server => server.address().port)
  servers.forEach(server => server.close())
  if (dummyServer) dummyServer.close()
  return ports
}

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms))

class ArticleDownloader {
  constructor(port) {
    this.process = spawn("./download_article.py", [port]);
    this.port = port
    this.running = true
    this.process.on("exit", () => this.running = false);
    console.log(`article downloader listening on port ${port}`)
  }

  wait() {
    while (!port_used(this.port) && this.running) {
      sleep(1000);
    }
    if (!this.running) {
      throw Error("process exited")
    }
  }

  download(url) { return axios.post(`http://localhost:${this.port}/`, {url}).then((response) => response.data.text) }
}

class SentenceSplitter {
  constructor(port) {
    this.process = spawn("./sentence_split.py", [port]);
    this.port = port
    this.running = true
    this.process.on("exit", () => this.running = false);
    console.log(`sentence splitter listening on port ${port}`)
  }

  wait() {
    while (!port_used(this.port) && this.running) {
      sleep(1000);
    }
    if (!this.running) {
      throw Error("process exited")
    }
  }

  split(text) { return axios.post(`http://localhost:${this.port}/`, {text}).then((response) => response.data.sentences) }
}

const [article_port, sentence_port] = get_free_ports(2)

const articleDownloader = new ArticleDownloader(article_port)
const sentenceSplitter = new SentenceSplitter(sentence_port)

articleDownloader.wait()
sentenceSplitter.wait()

module.exports = {articleDownloader, sentenceSplitter}
