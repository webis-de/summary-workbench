from typing import List, Tuple

from argument_models import create_function_validator
from metric import MetricPlugin
from pydantic import root_validator


def same_number_lines(_, values):
    batch = values["batch"]
    for i, (hypotheses, references) in enumerate(batch):
        len_hyp = len(hypotheses)
        len_ref = len(references)
        if len_hyp != len_ref:
            raise ValueError(
                f"hypotheses and references of element {i} of the batch do not have the same length ({len_hyp} != {len_ref})"
            )
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
            [("batch", Tuple[List[str], List[str]])],
            validators={"batch_validator": root_validator()(same_number_lines)},
        )
        try:
            self.metadata = self.plugin.metadata()
        except AttributeError:
            self.metadata = {}
