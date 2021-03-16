import itertools
from typing import Dict, List, Set, Tuple

import networkx as nx
import scipy.stats
from networkx import Graph

from .preprocessing import PreProcessor
from .scoring import Scorer


class TextRank(object):
    def __init__(
        self, weight_function: str = "lexical_overlap", enable_nlp: bool = False
    ):
        super().__init__()
        self.weight_function = weight_function
        self.enable_nlp = enable_nlp
        if self.weight_function == "entity_overlap":
            self.enable_nlp = True
        self.preprocessor = PreProcessor(self.enable_nlp)
        self.scorer = Scorer()
        print("TextRank initialized")

    def _build_graph(
        self,
        nodes: List[str],
        weight_function,
        entity_dict: Dict[str, Set[Tuple[str, str]]] = None,
    ) -> Graph:
        """Return a networkx graph instance.

        :param nodes: List of hashables that represent the nodes of a graph.
        """
        gr = nx.Graph()  # initialize an undirected graph
        gr.add_nodes_from(nodes)
        nodePairs = list(itertools.combinations(nodes, 2))
        # add edges to the graph (weighted by weight_function)
        for pair in nodePairs:
            firstString = pair[0]
            secondString = pair[1]
            if entity_dict:
                edge_weight = self.scorer.entity_overlap(
                    entity_dict[firstString], entity_dict[secondString]
                )
                gr.add_edge(firstString, secondString, weight=edge_weight)
            else:
                edge_weight = weight_function(firstString, secondString)
                gr.add_edge(firstString, secondString, weight=edge_weight)
        return gr

    def summarize(
        self,
        text: str = None,
        record: dict = None,
        ratio: float = 0.2,
        sep: str = " ",
        editorials: bool = False,
    ):
        """Return a paragraph style summary of the source text
        
        Args:
            text (string): Text to be summarized
            record (dict) : JSON representation of text to be summarized
            ratio (float, optional): Summary length in terms of ratio. Defaults to 0.2.
            weight_function (str, optional): Weight function to compute edge weights for graph. Defaults to "lexical_overlap". Options [lexical_overlap | embedding_similarity]
        """
        if text:
            sentences = self.preprocessor.extract_sentences(text, editorials)
            print(f"Document has {len(sentences)} sentences.")
        if record:
            sentences = self.preprocessor.extract_segments(record)
            print(f"Document has {len(sentences)} segments.")

        if self.weight_function == "lexical_overlap":
            graph = self._build_graph(sentences, self.scorer.lexical_overlap)
        if self.weight_function == "entity_overlap":
            print("Tagging entities in the document. This may take some time.")
            entity_dict = {}
            for sent in sentences:
                entity_dict[sent] = self.preprocessor.get_named_entities(sent)
            graph = self._build_graph(
                sentences, self.scorer.entity_overlap, entity_dict
            )

        calculated_page_rank = nx.pagerank(graph, weight="weight", max_iter=10000)
        # most important sentences in ascending order of importance
        key_sentences = sorted(
            calculated_page_rank, key=calculated_page_rank.get, reverse=False
        )
        # calculate ratio of important sentences to be returned as summary
        sents_to_extract = round(len(key_sentences) * ratio)
        print(f"Extracting {sents_to_extract} important sentences...")
        _temp_sentences = key_sentences[:sents_to_extract]
        _summary_sentences = [(i, item) for i, item in enumerate(_temp_sentences)]
        _summary_sentences.sort(key=lambda x: sentences.index(x[1]))
        summary_sentences = [item for i, item in _summary_sentences]
        return sep.join(summary_sentences)
