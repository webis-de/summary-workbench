from metric import MetricPlugin
import logging
import inspect

def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)
    logger.info("begin")
    MetricPlugin()
    logger.info("done")

if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
