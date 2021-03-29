RUN pip install flask gunicorn
ENV GUNICORN_CMD_ARGS=-cgunicorn.conf.py
CMD ["gunicorn", "wsgi:app"]
