const settings = {
  bert: {
    readable: "BERTScore",
    type: "semantic",
  },
  bleu: {
    readable: "BLEU",
    type: "lexical",
  },
  bleurt: {
    readable: "BLEURT",
    type: "semantic",
  },
  cider: {
    readable: "CIDEr",
    type: "lexical",
  },
  greedy_matching: {
    readable: "greedy matching",
    type: "lexical",
  },
  meteor: {
    readable: "METEOR",
    type: "lexical",
  },
  moverscore: {
    readable: "MoverScore",
    type: "semantic",
  },
  rouge: {
    readable: "ROUGE",
    type: "lexical",
  },
};

export { settings };
