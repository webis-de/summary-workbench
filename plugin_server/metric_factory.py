from typing import List, Tuple

from argument_models import create_function_validator
from metric import MetricPlugin
from pydantic import root_validator


def same_number_lines(_, values):
    len_refs = len(values["references"])
    for i, hyps in enumerate(values["batch"]):
        len_hyps = len(hyps)
        assert (
            len_hyps == len_refs
        ), f"hypotheses and references of element {i} of the batch do not have the same length ({len_hyps} != {len_refs})"
    return values


class MetricFactory:
    def __init__(self):
        self.plugin = MetricPlugin()
        self.func = self.plugin.evaluate
        (
            self.batch_validator,
            self.required_validator,
            self.argument_validator,
            self.full_validator,
        ) = create_function_validator(
            self.func,
            [("batch", List[List[str]]), ("references", List[str])],
            validators={"batch_validator": root_validator()(same_number_lines)},
        )
        try:
            self.metadata = self.plugin.metadata()
        except AttributeError:
            self.metadata = {}
