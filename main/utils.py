import pandas as pd
import numpy as np
import os


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

def create_info_request(dataset, target, params):
    data = {
        'dataset_path': os.path.abspath(dataset.path),
        'dataset_name': f'{dataset.name}.{dataset.format}',
        'target': target,
        'params': {param['label']: param['value'] for param in params}
    }
    print(data)
    return data