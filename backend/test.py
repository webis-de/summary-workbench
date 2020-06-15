from app.common.textsum import BertSummarizer

bertsum = BertSummarizer(model='distilbert-base-uncased', reduce_option='max')

text = "hello world"

bertsum(text, min_length=0, max_length=500, ratio=0.18)
