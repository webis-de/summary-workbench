class Settings():
    def __init__(self, metrics_info):
        self.settings = {}
        for metric, readable in metrics_info:
            self.settings[metric] = {
                "is_set": False,
                "readable": readable,
            }

    def todict(self):
        return self.settings

    def chosen_metrics(self):
        return [metric for metric, info in self.settings.items() if info["is_set"]]

    def set_metric(self, metric, value):
        self.settings[metric]["is_set"] = value
