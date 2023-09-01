import pandas as pd
import numpy as np
from statsmodels import robust
from .models import LearnModel, Dataset
import os


default_models = [
    'SVM',
    'Decision Tree',
    'RandomForestClassifier',
    'LogisticRegression',
    'GradientBoostingClassifier',
    'AdaBoostClassifier',
    'KNeighborsClassifier',
    'ExtraTreesClassifier',
    'MLPClassifier'
]


def read_dataset_file(dataset):
    if dataset.format == 'csv':
        file = pd.read_csv(os.path.join(dataset.path, f'{dataset.name}.{dataset.format}'))
    elif dataset.format == 'xlsx':
        file = pd.read_excel(os.path.join(dataset.path, f'{dataset.name}.{dataset.format}'))
    else:
        e = f'Not valid format "{dataset.format}"'
        print(e)
        raise Exception(e)
    file = file.fillna('')
    return file.to_dict('records'), [{'field': column} for column in file.columns], file.shape[0], file.shape[1]


# ----------
# Обучение
# ----------


def create_info_request(dataset, type_model, request, broker_key):
    print(request.data)
    records, _, _, _ = read_dataset_file(dataset)
    data = {
        'model_name': type_model,
        'broker_key': broker_key,
        'dataset': records,
        'target': request.data['target'],
        'params': []
    }
    print(data)
    return data

def convert_data_type(label, value, type_data, **kwargs):
    if value:
        if type_data == 'F':
            value = float(value)
        elif type_data == 'I':
            value = int(value)
        elif type_data == 'B':
            if value == 'True':
                value = True
            else:
                value = False
        else:
            value = value
    print(f'param ==> {label} = {value} ({type(value)})')
    return value


# ----------
# Статистика
# ----------

def get_number_info(column_name, dataset_column):
    print(dataset_column)
    count_nan = dataset_column.count() - dataset_column.dropna().count()
    percent_nan = float(
        "{:.2f}".format((dataset_column.count() - dataset_column.dropna().count()) / dataset_column.count() * 100))
    dataset_column = dataset_column.dropna()
    data = {
        'column': column_name,
        'type': 'number',
        'data': dataset_column.values.tolist(),
        'district': dataset_column.unique(),
        'count_nan': count_nan,
        'persent_nan': percent_nan,
        'district_appear': [
            {'value': k, 'count': v, 'percent': float("{:.2f}".format(v / dataset_column.count() * 100))} for k, v in
            dataset_column.value_counts().to_dict().items()],
        'min': dataset_column.min(),
        'max': dataset_column.max(),
        'range': dataset_column.max() - dataset_column.min(),
        'mean': dataset_column.mean(),
        'median': dataset_column.median(),
        'kurt': dataset_column.kurt(),
        'skew': dataset_column.skew(),
        'sum': dataset_column.sum(),
        'var': dataset_column.var(),
        'std': dataset_column.std(),
        'quantiles': dataset_column.quantile([.05, .25, .5, .75, .95]).to_dict(),
        'CV': dataset_column.std() / dataset_column.mean(),
        'MAD': robust.mad(dataset_column.values),
        'monotonicy': dataset_column.is_monotonic,
    }

    data['IQR'] = data['quantiles'][0.75] - data['quantiles'][0.25]
    return data

def get_categorial_info(column_name, dataset_column):
    print(dataset_column)
    count_nan = dataset_column.count() - dataset_column.dropna().count()
    percent_nan = float("{:.2f}".format((dataset_column.count() - dataset_column.dropna().count()) / dataset_column.count() * 100))
    dataset_column = dataset_column.dropna()
    data = {
        'column': column_name,
        'type': 'categorial',
        'data': dataset_column.values,
        'district': dataset_column.unique(),
        'count_nan': count_nan,
        'persent_nan': percent_nan,
        'district_appear': [{'value': k, 'count': v, 'percent': float("{:.2f}".format(v / dataset_column.count() * 100))} for k, v in dataset_column.value_counts().to_dict().items()],
    }
    return data

def get_statistic_info(dataset_table):
    if dataset_table.format == 'csv':
        dataset = pd.read_csv(os.path.join(dataset_table.path, f'{dataset_table.name}.{dataset_table.format}'))
    elif dataset_table.format == 'xlsx':
        dataset = pd.read_excel(os.path.join(dataset_table.path, f'{dataset_table.name}.{dataset_table.format}'))
    else:
        raise Exception('Not valid format')
    data = []
    for dc, dt in zip(dataset.columns, dataset.dtypes):
        if dt == 'float' or dt == 'int':
            print(get_number_info(dc, dataset[dc]))
            data.append(get_number_info(dc, dataset[dc]))
        else:
            print(get_categorial_info(dc, dataset[dc]))
            data.append(get_categorial_info(dc, dataset[dc]))
    # data = ProfileReport(dataset, title="Profiling Report")
    # data = data.to_json()
    return data


