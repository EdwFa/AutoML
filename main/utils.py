import pandas as pd
import numpy as np


def read_dataset_file(dataset):
    if dataset.format == 'csv':
        file = pd.read_csv(dataset.path)
    elif dataset.format == 'xlsx':
        file = pd.read_excel(dataset.path)
    else:
        raise Exception('Not valid format')
    file = file.fillna('')

    print(file)
    print(file.columns)
    print(file.shape[0])
    return file.to_dict('records'), [{'field': column} for column in file.columns], file.shape[0], file.shape[1]