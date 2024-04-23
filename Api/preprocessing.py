import os.path
from sklearn.utils import shuffle
from sklearn.model_selection import train_test_split


import numpy as np
import pandas as pd

formats = ['csv', 'xlsx', 'xls']

def load_data(dataset, target, count, *labels):
    print(f'Load dataset...')
    data = pd.read_csv(dataset.stream)
    data.dropna(subset=[target], inplace=True)
    if labels is not None:
        data = data[[target, *labels]]
        data = shuffle(data)
        data = data.iloc[0:count,:]
    print(data)

    return data


# Используется для создания словаря меток для каждого столбца во входных данных DataFrame
def sort_data(data, categorical, number):
    # Создание словаря
    labels = {}
    # Перебирает каждый столбец во входных данных фрейма данных,
    # чтобы извлечь тип данных, метку столбца и количество уникальных значений для каждого столбца
    for dtype, label, uniqval in zip(data.dtypes, data.columns, data.nunique()):
        info = {}
        # Для каждого столбца создается словарь, который содержит информацию о столбце, включая его тип данных,
        # является ли он категориальным или числовым, кол-во уникальных значений и следует ли его использовать при дальнейшем анализе
        print(f'column --> {label} is {dtype}')
        if label in categorical:
            info['type'] = 0
        elif label in number:
            info['type'] = 1
        elif dtype == 'float' or dtype == 'int':
            info['type'] = 1
        else:
            info['type'] = 0

        # Добавление информационного словарь в словарь меток, используя метку столбца в качестве ключа
        info['uniq_vals'] = uniqval
        info['use'] = True
        labels[label] = info
    if 'ID' in data.columns:
        labels['ID']['use'] = False
    if '№' in data.columns:
        labels['ID']['use'] = False
    return labels

# Разделение на обучающий и тестовый наборы
def preprocess_data(data, target, labels, test_size=0.2):
    # Генерация случ состояния
    random_state = int(test_size * 100) % 17
    print(test_size, random_state)
    columns = []
    columns_info = []
    # Просмотр каждой метки в словаре меток
    for label in labels:
        # Создает копию соответствующего столбца из dataframe и
        # выполняет некоторую предварительную обработку в зависимости от его типа
        if labels[label]['use'] == False:
            continue
        column = data[label].copy()
        # Функция заполняет все пропущенные значения медианой столбца, вычисляет среднее значение и стандартное
        # отклонение столбца и масштабирует столбец, чтобы получить нулевое среднее значение и единичную дисперсию
        if labels[label]['type'] == 1:
            column.fillna(column.median(), inplace=True)
            mean = column.mean()
            std = column.std()
            column = (column - mean) / std
            columns.append(column.to_numpy())
            labels[label]['count'] = 1
            columns_info.append(dict(label=label, type='num', mean=mean, std=std))
        else:
            # Функция заполняет все пропущенные значения режимом столбца, создает словарь, преобразующий каждую
            # уникальную категорию в целое число, и преобразует столбец в двоичную матрицу с помощью однократного преобразования
            column.fillna(column.mode().values[0], inplace=True)
            categ_list = {category: i for i, category in enumerate(data[label].unique().tolist())}
            matrix = np.zeros((column.shape[0], len(categ_list)))
            for i, val in zip(range(column.shape[0]), column):
                matrix[i, categ_list[val]] = 1
            columns.append(matrix)
            labels[label]['count'] = len(categ_list)
            params = [{'cat': k, 'val': v} for k, v in categ_list.items()]
            # Ф-я добавляет предварительно обработанный столбец в список столбцов и добавляет словарь, содержащий ин-ию о столбце
            columns_info.append(dict(label=label, type='cat', params=params))
    columns = [column.reshape(column.shape[0], 1) if len(column.shape) == 1 else column for column in columns]
    # Ф-я объединяет все предварительно обработанные столбцы вдоль оси объектов, чтобы создать единую матрицу объектов
    dataset = np.concatenate(columns, axis=1)
    print('Dataset is:', dataset)
    X_train, X_test, y_train, y_test = train_test_split(dataset, target, test_size=1-test_size, random_state=random_state)
    feature_names = pd.DataFrame(X_train).columns.tolist()
    print('\n\n\n', 'Feature names used for training: ', feature_names, '\n\n\n')
    return  X_train, y_train, X_test, y_test, columns_info


def check_filename(filename):
    file_path = '/'.join(filename.split('/')[:-1])
    print(file_path)
    if not os.path.exists(file_path):
        os.mkdir(file_path)
    return filename