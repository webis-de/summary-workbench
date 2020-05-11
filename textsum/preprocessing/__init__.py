import sys

sys.path.insert(1, ".")

import syntok.segmenter as sentence_segmenter
import spacy
import itertools
from typing import Set, List, Tuple


class PreProcessor:
    def __init__(self, enable_nlp: bool = False):
        super().__init__()
        self.enable_nlp = enable_nlp
        if self.enable_nlp:
            print("NLP enabled -> loading spacy")
            self.nlp = spacy.load("en_core_web_md")
            if self.nlp:
                print("Finished loading spacy")

    def extract_sentences(self, text: str, editorials: bool = False):
        """Returns a list of sentences or segmented units
        
        Args:
            text (str): Text to be segmented into sentences
            editorials (bool, optional): If True, return segments. Defaults to False.
        """
        if editorials:
            return self._get_segments_from_editorials(text)
        else:
            return self._get_sentences_from_text(text)

    def _get_sentences_from_text(self, text: str) -> List[str]:
        """Returns list of sentences.
        
        Args:
            text (string): Text to be split into sentences.
        """
        processed_segments = sentence_segmenter.analyze(text)
        sentences = []
        for paragraph in processed_segments:
            for sentence in paragraph:
                sentences.append("".join(map(str, sentence)).lstrip())
        return sentences

    def get_named_entities(
        self, text: str, get_labels: bool = False
    ) -> Set[Tuple[str, str]]:
        doc = self.nlp(text)
        labeled_entities = []
        for ent in doc.ents:
            if get_labels:
                labeled_entities.append((ent.text, ent.label_))
            else:
                labeled_entities.append((ent.text, None))
        return set(labeled_entities)

    def extract_segments(self, record: dict) -> List[str]:
        """Returns a list of segments from json record (except 'no-unit' segments)
        
        Args:
            record (dict): [description]
        
        Returns:
            List[str]: [description]
        """
        # exclude title
        doc_sentences = list(itertools.chain.from_iterable(record['paragraphs']))[1:]
        segments = [d['text'] for d in doc_sentences if d['label'] != 'no-unit']
        return segments

