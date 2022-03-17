import torch
import numpy as np
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from pathlib import Path
from model_setup import SAVE_PATH

CHECKPOINT_PATH = SAVE_PATH / "checkpoints/cnn-dm"

class GPT2:
    def __init__(self, device="cpu", location="") -> None:
        """
        Citation: https://github.com/HendrikStrobelt/detecting-fake-text/blob/master/backend/api.py
        Model class for GPT-2. Primarily used to obtain word probabilities
        """
        if location == "":
            self.enc = GPT2Tokenizer.from_pretrained("gpt2-large")
            self.model = GPT2LMHeadModel.from_pretrained("gpt2-large")
        else:
            self.enc = GPT2Tokenizer.from_pretrained(location)
            self.model = GPT2LMHeadModel.from_pretrained(location)
        self.device = torch.device(device)
        if self.model:
            print("GPT2 Initialized")
        self.model.eval()
        self.start_tok = "<|endoftext|>"
        self.model.to(self.device)
    
    def pad(self, context):
        "context is a collection of sentences"
        max_len = max([len(sentence) for sentence in context])
        for i in range(len(context)):
            for j in range(max_len - len(context[i])):
                context[i].append(context[i][0])
        return context
    
    def get_probabilities(self, in_text, topk=40):
        """ 
        Take in a sequence of text tokens, make predictions on each word given past context and 
        return topk
        Returns:
            Dictionary "payload" containing:
            real_probs
                - List of tuples, one for each token in sequence
                - Probability of the actual words in the sequence
                - Each tuple of the form (position of next word in prediction, predicted probability)
            context_strings:
                - Strings in the sequence along with start token
        """
        with torch.no_grad():
            start_tok = torch.full((1, 1), self.enc.encoder[self.start_tok],
            device=self.device, dtype=torch.long)
            context = [self.start_tok+" "+in_text[i] for i in range(len(in_text))]
            context = [self.enc.encode(context[i]) for i in range(len(context))]
            context = self.pad(context)
            context = torch.tensor(context, device=self.device, dtype=torch.long)
            outputs = self.model(context)
            logits = outputs.logits
            yhat = torch.softmax(logits[:, :-1], dim=-1)
            y = context[:, 1:]
            real_topk_probs = [yhat[t][np.arange(0, y[t].shape[0], 1), y[t]].data.cpu().numpy().tolist() for t in range(yhat.shape[0])]
            real_topk_probs = [list(map(lambda x: round(x, 15), real_topk_probs[t])) for t in range(len(real_topk_probs))]

            real_topk = [list(real_topk_probs[t]) for t in range(len(real_topk_probs))]
        
            context_strings = [[self.enc.decoder[s.item()] for s in context[t]] for t in range(len(context))]
            context_strings = [[self.postprocess(s) for s in context_strings[t]] for t in range(len(context_strings))]
            del context, logits, y, yhat, 
            if self.device == "gpu":
                torch.cuda.empty_cache()
        """ 
        pred_topk = [[list(zip([self.enc.decoder[p] for p in sorted_preds[t][i][:topk]],
            list(map(lambda x: round(x, 5),yhat[t][i][sorted_preds[t][i][
                :topk]].data.cpu().numpy().tolist()))))
                    for i in range(y[t].shape[0])] for t in range(y.shape[0])]
        pred_topk = [[[(self.postprocess(t[0]), t[1]) for t in pred] for pred in pred_topk[t]] for t in range(len(pred_topk))]
        """
        payload = {'context_strings': context_strings, 
            'real_probs': real_topk}#, 'pred_topk': pred_topk}
        
        return payload
    
    def postprocess(self, token):
        if token[0] == 'Ġ':
            token = token[1:]
        elif token.startswith('â'):
            token = ' '
        elif token.startswith('Ċ'):
            token = ' '        
        if len(token)>0 and token[0] == "Â":
            token = token[1:]
        token = '-' if token.startswith('â') else token
        token = '“' if token.startswith('ľ') else token
        token = '”' if token.startswith('Ŀ') else token
        token = "'" if token.startswith('Ļ') else token
        return token

if __name__ == "__main__":
    model = GPT2(location=CHECKPOINT_PATH)
    doc = " ".join(open("sample.txt").readlines())
    context = doc.split(". ")
    print(len(context))
    payload = model.get_probabilities(context, topk=20)
    print(len(payload['context_strings']))