from newspaper import Article
from utils.aio import to_threaded


@to_threaded
def download_article(url):
    article = Article(url)
    article.download()
    article.parse()
    return {"text": article.text, "title": article.title}
