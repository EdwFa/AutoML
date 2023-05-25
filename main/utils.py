import pandas as pd
import numpy as np
from statsmodels import robust
from .models import DefaultNetwork, ModelDefaultParam, Networks
import os


default_models = [
    {
        'SVM': [
            ['C', '1.0', 'F'],
            ['kernel', 'rbf', 'S', 'linear poly rbf sigmoid precomputed'],
            ['gamma', 'scale', 'S', 'scale auto'],
            ['coef0', '0.0', 'F'],
            ['shrinking', 'True', 'B'],
            ['probability', 'True', 'B'],
            ['tol', '0.001', 'F'],
            ['cache_size', '200', 'F'],
            ['verbose', 'False', 'B'],
            ['max_iter', '1', 'I'],
            ['decision_function_shape', 'ovr', 'S', 'ovr ovo'],
            ['break_ties', 'False', 'B'],
            ['random_state', None, 'I']
        ]
    },
    {
        'Decision Tree': [
            ['criterion', 'gini', 'S', 'gini entropy log_loss'],
            ['splitter', 'best', 'S', 'best random'],
            ['max_depth', None, 'I'],
            ['min_samples_split', '2', 'F'],
            ['min_samples_leaf', '1', 'F'],
            ['min_weight_fraction_leaf', '0.0', 'F'],
            ['max_features', None, 'S', 'auto sqrt log2'],
            ['random_state', None, 'I'],
            ['max_leaf_nodes', None, 'I'],
            ['min_impurity_decrease', '0.0', 'F'],
            ['ccp_alpha', '0.0', 'F']
        ]
    },
    {
        'RandomForestClassifier': []
    },
    {
        'LogisticRegression': []
    },
    {
        'GradientBoostingClassifier': []
    },
    {
        'AdaBoostClassifier': []
    },
    {
        'KNeighborsClassifier': []
    },
    {
        'ExtraTreesClassifier': []
    },
    {
        'MLPClassifier': []
    },
]

def fill_models():
    for model in default_models:
        for key, params in model.items():
            print(key)
            try:
                default_model = DefaultNetwork.objects.get(name=key)
            except:
                default_model = DefaultNetwork.objects.create(name=key)
            for param in params:
                param_dict = {'model': None, 'label': None, 'value': None, 'type_data': None, 'choices_values': None}
                param = [default_model] + param
                for key_value, value in zip(param_dict, param):
                    param_dict[key_value] = value
                print(param_dict)
                ModelDefaultParam.objects.create(**param_dict)
            print('-------')
    return True

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


# ----------
# Обучение
# ----------


def create_info_request(dataset, type_model, request):
    print(request.data)
    data = {
        'model_name': type_model,
        # 'model_path': f'models/{request.user.username}/{new_model.id}_{request.data["model"]["name"]}_{request.data["target"]}.sav',
        'dataset_path': os.path.abspath(dataset.path),
        'dataset_name': f'{dataset.name}.{dataset.format}',
        'target': request.data['target'],
        'params': {param['label']: convert_data_type(**param) for param in request.data['model']['param']},
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
        dataset = pd.read_csv(dataset_table.path)
    elif dataset_table.format == 'xlsx':
        dataset = pd.read_excel(dataset_table.path)
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