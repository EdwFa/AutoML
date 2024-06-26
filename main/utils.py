import json

from django.core.exceptions import ObjectDoesNotExist

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, ExtraTreesClassifier
from sklearn.ensemble import GradientBoostingClassifier


import pandas as pd
import numpy as np
import pickle
from joblib import dump, load
from statsmodels import robust
from .models import LearnModel, Dataset, User
import os


default_models = [
    ['Опорные вектора', 'SVM', 1],
    ['Деревья решений', 'Decision Tree', 1],
    ['Случайный лес', 'RandomForestClassifier', 1],
    ['Логистическая регрессия', 'LogisticRegression', 1],
    ['Градиентный бустинг', 'GradientBoostingClassifier', 1],
    ['Ада бустинг', 'AdaBoostClassifier', 1],
    ['Ближайшие соседи', 'KNeighborsClassifier', 1],
    ['Дополнительные деравья', 'ExtraTreesClassifier', 1],
    ['Нейронная сеть', 'MLPClassifier', 1],
    ['Гистограммный бустинг', 'HistGradientBoostingClassifier', 1],
    ['Фиктивная регрессия', 'DummyRegression', 2],
    ['Линейная регрессия', 'LinearRegression', 2],
    ['Catboost регрессия', 'CatboostRegression', 2],
    ['LGBMRegressor', 'LGBMRegressor', 2]
]

get_grid_type = lambda x : "agNumberColumnFilter" if (x == 'int' or x == 'float') else "agTextColumnFilter"

def get_dataset_obj(request):
    dataset_id = int(request.GET.get('datasetId'))
    try:
        dataset = Dataset.objects.get(id=dataset_id)
    except ObjectDoesNotExist:
        return None
    else:
        if not request.user.is_superuser and dataset.user.username != request.user.username:
            return None
        return dataset


async def get_dataset_obj_async(request):
    dataset_id = int(request.GET.get('datasetId'))
    try:
        dataset = await Dataset.objects.aget(id=dataset_id)
    except ObjectDoesNotExist:
        return None
    else:
        dataset_user = await User.objects.aget(datasets=dataset)
        if not request.user.is_superuser and dataset_user.username != request.user.username:
            return None
        return dataset

def read_dataset_file(dataset, drop_or_fill='fill'):
    try:
        file = pd.read_csv(dataset.get_dataset_path())
    except:
        e = f'Not valid format "{dataset.format}"'
        print(e)
        raise Exception(e)
    dtypes = file.dtypes
    if drop_or_fill == 'fill':
        file = file.fillna('')
    else:
        file = file.dropna()
    return file.to_dict('records'), file.columns, file.shape[0], file.shape[1], dtypes




# ----------
# Обучение
# ----------

def create_info_request(request, type_models, params, score, count):
    print(request.data)
    data = {
        'model_name': json.dumps(type_models),
        'user': request.user.username,
        'target': request.data['target'],
        'categorical_columns': request.data.get('categorical_columns', ""),
        'number_columns': request.data.get('number_columns', ""),
        'params': json.dumps(params),
        'score': score,
        'count': count
    }
    if data['categorical_columns'] != "":
        data['categorical_columns'] = ';;;'.join(data['categorical_columns'])
    if data['number_columns'] != "":
        data['number_columns'] = ';;;'.join(data['number_columns'])
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


# ----------
# Сохранение и использование
# ----------
def predict_classification(data, model):
    predict_params = []
    for value, param in zip(data['params'], model.configs):
        print(value)
        print(param)
        if value[1] == None:
            raise Exception('Params cant be null value')
        if isinstance(value[1], dict):
            i = [0 for j in param['params']]
            i[value[1]['val']] = 1
            for j in i:
                predict_params.append(j)
        else:
            i = (value[1] - param['mean']) / param['std']
            predict_params.append(i)
        print('----')
    print(predict_params)
    m = load(model.get_model_file())
    max = m.predict([predict_params])
    pred_softmax = m.predict_proba([predict_params])
    configs = model.configs[-1]
    pred = [{'label': configs[0], 'target': i, 'value': round(j, 2), 'max': False} for i, j in
            zip(configs[1:], pred_softmax[0])]
    print(pred, max)
    for i in pred:
        if i['target'] == max[0]:
            i['max'] = True
    return pred

def predict_regression(data, model):
    predict_params = []
    for value, param in zip(data['params'], model.configs):
        print(value)
        print(param)
        if value[1] == None:
            raise Exception('Params cant be null value')
        if isinstance(value[1], dict):
            i = [0 for j in param['params']]
            i[value[1]['val']] = 1
            for j in i:
                predict_params.append(j)
        else:
            i = (value[1] - param['mean']) / param['std']
            predict_params.append(i)
        print('----')
    print(predict_params)
    m = load(model.get_model_file())
    max = m.predict([predict_params])
    pred = round(max[0], 2)
    return pred

def predict(data, modelId):
    model = LearnModel.objects.get(id=modelId)
    print(model)
    if model.type == 1:
        return predict_classification(data, model)
    elif model.type == 2:
        return predict_regression(data, model)
    else:
        return None





