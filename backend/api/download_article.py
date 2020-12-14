#!/usr/bin/python3
from sys import argv, stdout

from newspaper import Article

article = Article(argv[1])
article.download()
article.parse()

stdout.write(article.text)
stdout.flush()
