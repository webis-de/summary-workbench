from typing import List, Tuple

from argument_models import create_function_validator
from pydantic import Field, root_validator
from summarizer import SummarizerPlugin


class SummarizerFactory:
    def __init__(self):
        self.plugin = SummarizerPlugin()
        self.func = self.plugin.summarize
        (
            self.batch_validator,
            self.required_validator,
            self.argument_validator,
            self.full_validator,
        ) = create_function_validator(
            self.func,
            [("batch", List[str])],
            {
                "ratio": (
                    float,
                    Field(
                        0.2,
                        gt=0,
                        lt=1,
                        description="The ratio must be in the closed interval (0,1)",
                    ),
                )
            },
        )
        try:
            self.metadata = self.plugin.metadata()
        except AttributeError:
            self.metadata = {}
