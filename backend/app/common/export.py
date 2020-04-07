import pandas as pd
import logging


def export_scores(scores, export_format, precision=4, transpose=False):
    export_format = export_format.lower()

    if export_format == "csv":
        return to_csv(scores, precision=precision, transpose=transpose)
    elif export_format == "latex":
        return to_latex(scores, precision=precision, transpose=transpose)
    else:
        raise Exception(f"unknown format: {export_format}")


def to_csv(scores, precision=4, transpose=False):
    series = pd.Series()
    for metric, score_info in scores.items():
        if metric == "rouge":
            s = pd.DataFrame(score_info).unstack()
            s.index = s.index.map(lambda i: f"{i[0]} - {i[1]}")
        elif metric == "bleu":
            s = pd.Series(score_info)
        else:
            s = pd.Series({metric: score_info})
        series = pd.concat((series, s))

    if transpose:
        index = False
        series = series.to_frame().T
    else:
        series.name = "score"
        series.index.name = "metric"
        index = True
    return series.to_csv(float_format=f"%.{precision}f", index=index)


def to_latex(scores, precision=4, transpose=False):
    if len(scores) == 1 and "rouge" in scores:
        dataframe = pd.DataFrame(scores["rouge"])
    else:
        series = pd.Series()
        for metric, score_info in scores.items():
            if metric == "rouge":
                s = pd.DataFrame(score_info).unstack()
                s.index = s.index.map(lambda i: f"{i[0]} - {i[1]}")
            elif metric == "bleu":
                s = pd.Series(score_info)
            else:
                s = pd.Series({metric: score_info})
            series = pd.concat((series, s))
        series.name = "score"
        dataframe = series.to_frame()
    if transpose:
        dataframe = dataframe.T
    return dataframe.to_latex(float_format=f"%.{precision}f", bold_rows=True)
