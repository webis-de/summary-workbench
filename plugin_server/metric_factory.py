from typing import List, Tuple

from argument_models import create_function_validator
from metric import MetricPlugin


class MetricFactory:
    def __init__(self):
        self.plugin = MetricPlugin()
        self.func = self.plugin.evaluate
        (
            self.batch_validator,
            self.required_validator,
            self.argument_validator,
            self.full_validator,
        ) = create_function_validator(self.func, [("batch", List[Tuple[str, str]])])
        try:
            self.metadata = self.plugin.metadata()
        except AttributeError:
            self.metadata = {}
