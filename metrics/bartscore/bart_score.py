# %%
from typing import List

import numpy as np
import torch
import torch.nn as nn
from transformers import BartForConditionalGeneration, BartTokenizer


class BARTScorer:
    def __init__(
        self, device="cuda:0", max_length=1024, checkpoint="facebook/bart-large-cnn"
    ):
        # Set up model
        self.device = device
        self.max_length = max_length
        self.tokenizer = BartTokenizer.from_pretrained(checkpoint)
        self.model = BartForConditionalGeneration.from_pretrained(checkpoint)
        self.model.eval()
        self.model.to(device)

        # Set up loss
        self.loss_fct = nn.NLLLoss(
            reduction="none", ignore_index=self.model.config.pad_token_id
        )
        self.lsm = nn.LogSoftmax(dim=1)

    def load(self, path=None):
        """Load model from paraphrase finetuning"""
        if path is None:
            path = "models/bart.pth"
        self.model.load_state_dict(torch.load(path, map_location=self.device))

    def score(self, srcs, tgts, batch_size=4):
        """Score a batch of examples"""
        score_list = []
        for i in range(0, len(srcs), batch_size):
            src_list = srcs[i : i + batch_size]
            tgt_list = tgts[i : i + batch_size]
            with torch.no_grad():
                encoded_src = self.tokenizer(
                    src_list,
                    max_length=self.max_length,
                    truncation=True,
                    padding=True,
                    return_tensors="pt",
                )
                encoded_tgt = self.tokenizer(
                    tgt_list,
                    max_length=self.max_length,
                    truncation=True,
                    padding=True,
                    return_tensors="pt",
                )
                src_tokens = encoded_src["input_ids"].to(self.device)
                src_mask = encoded_src["attention_mask"].to(self.device)

                tgt_tokens = encoded_tgt["input_ids"].to(self.device)
                tgt_mask = encoded_tgt["attention_mask"]
                tgt_len = tgt_mask.sum(dim=1).to(self.device)

                output = self.model(
                    input_ids=src_tokens, attention_mask=src_mask, labels=tgt_tokens
                )
                logits = output.logits.view(-1, self.model.config.vocab_size)
                loss = self.loss_fct(self.lsm(logits), tgt_tokens.view(-1))
                loss = loss.view(tgt_tokens.shape[0], -1)
                loss = loss.sum(dim=1) / tgt_len
                curr_score_list = [-x.item() for x in loss]
                score_list += curr_score_list
        return score_list

    def multi_ref_score(self, srcs, tgts: List[List[str]], agg="mean", batch_size=4):
        # Assert we have the same number of references
        ref_nums = [len(x) for x in tgts]
        if len(set(ref_nums)) > 1:
            raise Exception("You have different number of references per test sample.")

        ref_num = len(tgts[0])
        score_matrix = []
        for i in range(ref_num):
            curr_tgts = [x[i] for x in tgts]
            scores = self.score(srcs, curr_tgts, batch_size)
            score_matrix.append(scores)
        if agg == "mean":
            score_list = np.mean(score_matrix, axis=0)
        elif agg == "max":
            score_list = np.max(score_matrix, axis=0)
        else:
            raise NotImplementedError
        return list(score_list)
