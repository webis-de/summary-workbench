#!/usr/bin/env python3

import requests


def get(url, json=None):
    r = requests.post(url, json=json) if json else requests.get(url)
    if r.ok:
        return r.json()
    else:
        r.raise_for_status()


class Api:
    def __init__(self, host):
        self.host = host

    def get_metrics(self):
        return get(f"{self.host}/api/metrics")

    def get_summarizers(self):
        return get(f"{self.host}/api/summarizers")

    def evaluate(self, metrics, hypotheses, references):
        return get(
            f"{self.host}/api/evaluate",
            json={
                "metrics": metrics,
                "hypotheses": hypotheses,
                "references": references,
            },
        )

    def summarize(self, text, summarizers, ratio):
        return get(
            f"{self.host}/api/summarize",
            json={"text": text, "summarizers": summarizers, "ratio": ratio},
        )


if __name__ == "__main__":
    from pprint import pprint
    from sys import stdin

    import click
    from termcolor import colored

    def read_file(filename):
        with open(filename, "r") as f:
            return f.read().splitlines()

    def clean_lines(lines):
        lines = [line.strip() for line in lines if line.strip()]
        return "\n".join(lines)

    @click.group()
    @click.option(
        "--host",
        required=True,
        help="host address where the tldr app is running (e.g. https://www.example.com)",
    )
    @click.pass_context
    def main(ctx, host):
        ctx.ensure_object(dict)
        ctx.obj["api"] = Api(host)

    @main.command(help="list available metrics or show more information about a metric")
    @click.option(
        "--verbose",
        is_flag=True,
        default=False,
        help="show all information about all metrics",
    )
    @click.argument("metrics", nargs=-1)
    @click.pass_context
    def list_metrics(ctx, verbose, metrics):
        api = ctx.obj["api"]
        available_metrics = api.get_metrics()
        if verbose:
            pprint(available_metrics)
        elif not metrics:
            pprint(list(available_metrics.keys()))
        else:
            unknown_metrics = set(metrics).difference(set(available_metrics.keys()))
            if unknown_metrics:
                print(f"unknown metrics: {list(unknown_metrics)}")
            else:
                pprint(
                    dict(
                        pair for pair in available_metrics.items() if pair[0] in metrics
                    )
                )

    @main.command(help="evaluate 2 files with the given metrics")
    @click.option(
        "--hypfile", default=None, help="file where each line in a hypothesis"
    )
    @click.option("--reffile", default=None, help="file where each line is a reference")
    @click.argument("metrics", nargs=-1)
    @click.pass_context
    def evaluate(ctx, hypfile, reffile, metrics):
        api = ctx.obj["api"]
        metrics = list(metrics)
        if not hypfile:
            click.echo("--hypfile is missing")
        elif not reffile:
            click.echo("--reffile is missing")
        elif not metrics:
            click.echo("no metrics given")
        else:
            hypotheses = read_file(hypfile)
            references = read_file(reffile)
            pprint(api.evaluate(metrics, hypotheses, references))

    @main.command(help="list available metrics or show more information about a metric")
    @click.option(
        "--verbose",
        is_flag=True,
        default=False,
        help="show all information about all metrics",
    )
    @click.argument("metrics", nargs=-1)
    @click.pass_context
    def list_summarizers(ctx, verbose, metrics):
        api = ctx.obj["api"]
        available_summarizers = api.get_summarizers()
        if verbose:
            pprint(available_summarizers)
        elif not metrics:
            pprint(list(available_summarizers.keys()))
        else:
            unknown_metrics = set(metrics).difference(set(available_summarizers.keys()))
            if unknown_metrics:
                print(f"unknown metrics: {list(unknown_metrics)}")
            else:
                pprint(
                    dict(
                        pair
                        for pair in available_summarizers.items()
                        if pair[0] in metrics
                    )
                )

    @main.command(help="summarize text from stdin or the content of a file")
    @click.option(
        "--file", default=None, help="file that contains the text to summarize"
    )
    @click.option(
        "--ratio",
        default=0.1,
        help="length of the summarization to generate based on the lenght of the doucment",
    )
    @click.option("--raw", is_flag=True, default=False, help="show raw response")
    @click.argument("summarizers", nargs=-1)
    @click.pass_context
    def summarize(ctx, file, ratio, raw, summarizers):
        api = ctx.obj["api"]
        summarizers = list(summarizers)
        if not summarizers:
            click.echo("no summarizers given")
        else:
            text = stdin.read().strip() if not file else read_file(file)
            response = api.summarize(text, summarizers, ratio)
            if raw or not "summaries" in response:
                pprint(response)
            else:
                original = response["original"]
                title = original.get("title")
                print(colored("original: " + (title if title else ""), "green"))
                print(clean_lines(original["text"]))
                for summarizer, summary in response["summaries"].items():
                    print()
                    print(colored(f"{summarizer}:", "green"))
                    print(clean_lines(summary))

    main()
