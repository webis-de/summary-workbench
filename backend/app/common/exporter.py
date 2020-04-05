import pandas as pd

def to_latex(table):
    return pd.DataFrame(table).to_latex()

def to_csv(table):
    return pd.DataFrame(table).to_csv()
