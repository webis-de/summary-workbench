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
    series = []
    for score_info in scores.values():
        series.append(pd.Series(score_info, name="score"))
    series = pd.concat(series)
    series.index.name = "metric"

    dataframe = series.to_frame()
    index = True
    if transpose:
        dataframe = dataframe.T
        index = False
    return dataframe.to_csv(float_format=f"%.{precision}f", index=index)


def to_latex(scores, precision=4, transpose=False):
    series = []
    for score_info in scores.values():
        series.append(pd.Series(score_info, name="score"))
    series = pd.concat(series)

    dataframe = series.to_frame()
    if transpose:
        dataframe = dataframe.T
    return dataframe.to_latex(float_format=f"%.{precision}f", bold_rows=True)
