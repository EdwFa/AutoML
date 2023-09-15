import os.path

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, ExtraTreesClassifier
from sklearn.ensemble import GradientBoostingClassifier

from sklearn.metrics import confusion_matrix, accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_curve, roc_auc_score

from sklearn.neural_network import MLPClassifier, MLPRegressor

from sklearn.linear_model import SGDClassifier

import numpy as np
import pandas as pd
import math


# models = {
#     'SVM': SVC,
#     'Decision Tree': DecisionTreeClassifier,
#     'Random Forest': RandomForestClassifier,
#     'Logistic Regression': LogisticRegression,
#     'GradientBoostingClassifier': GradientBoostingClassifier,
#     'AdaBoost': AdaBoostClassifier,
#     'KNN': KNeighborsClassifier,
#     'ExtraTrees': ExtraTreesClassifier,
#     'MLPClassifier': MLPClassifier
# }
models = {
    'SVM': SVC(probability=True),
    'Decision Tree': DecisionTreeClassifier(),
    'RandomForestClassifier': RandomForestClassifier(),
    'LogisticRegression': LogisticRegression(max_iter=200),
    'GradientBoostingClassifier': GradientBoostingClassifier(n_estimators=100, learning_rate=1.0,
                                                             max_depth=1, random_state=0),
    'AdaBoostClassifier': AdaBoostClassifier(),
    'KNeighborsClassifier': KNeighborsClassifier(),
    'ExtraTreesClassifier': ExtraTreesClassifier(n_estimators=10, max_depth=None, min_samples_split=2, random_state=0),
    'MLPClassifier': MLPClassifier(solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(15,), random_state=1)
}

formats = ['csv', 'xlsx', 'xls']

def load_data(dataset, target, *labels):
    print(f'Load dataset...')
    data = pd.DataFrame.from_records(dataset)
    if labels is not None:
        data = data[[target, *labels]]
    print(data.columns)
    if 'ID' in data.columns:
        return data.drop(['ID'], axis=1)
    elif 'id' in data.columns:
        return data.drop(['id'], axis=1)
    else:
        print('No one id column')
        return data


def sort_data(data, categorical, number):
    labels = {}
    for dtype, label, uniqval in zip(data.dtypes, data.columns, data.nunique()):
        info = {}
        print(f'column --> {label} is {dtype}')
        if label in categorical:
            info['type'] = 0
        elif label in number:
            info['type'] = 1
        elif dtype == 'float' or dtype == 'int':
            info['type'] = 1
        else:
            info['type'] = 0

        info['uniq_vals'] = uniqval
        info['use'] = True
        labels[label] = info
    if 'ID' in data.columns:
        labels['ID']['use'] = False
    return labels

def preprocess_data(data, target, labels):
    columns = []
    for label in labels:
        if labels[label]['use'] == False:
            print('Not Use --> ', label)
            categ_list = {category: i for i, category in enumerate(data[label].unique().tolist())}
            print(f"Column {label} Catefory list == ", categ_list)
            continue
        column = data[label].copy()
        if labels[label]['type'] == 1:
            column.fillna(column.median(), inplace=True)
            mean = column.mean()
            print(f'Column {label} mean = ', mean)
            column = column / mean
            columns.append(column.to_numpy())
        else:
            column.fillna(column.mode().values[0], inplace=True)
            categ_list = {category: i for i, category in enumerate(data[label].unique().tolist())}
            matrix = np.zeros((column.shape[0], len(categ_list)))
            for i, val in zip(range(column.shape[0]), column):
                matrix[i, categ_list[val]] = 1
            print(f"Column {label} Catefory list == ", categ_list)
            columns.append(matrix)
    print([len(column.shape) for column in columns])
    columns = [column.reshape(column.shape[0], 1) if len(column.shape) == 1 else column for column in columns]
    print([column.shape for column in columns])
    dataset = np.concatenate(columns, axis=1)
    print(dataset.shape)
    X_train, X_test, y_train, y_test = train_test_split(dataset, target, test_size=0.20, random_state=786)
    return X_train, y_train, X_test, y_test

def check_filename(filename):
    file_path = '/'.join(filename.split('/')[:-1])
    print(file_path)
    if not os.path.exists(file_path):
        os.mkdir(file_path)
    return filename

def trainer(X_train, y_train, X_test, y_test, model_name, label_name, **params):
    print("params ", params)
    model = models[model_name]
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    y_test_org = np.unique(y_test)
    print(y_test_org)
    targets_org = [label for label in y_test_org]
    print("Targets original == ", targets_org)
    cm_model = confusion_matrix(y_test, pred)
    print("metrics == ", cm_model.ravel())
    train_accuracy = accuracy_score(y_train, model.predict(X_train))
    test_accuracy = accuracy_score(y_test, pred)
    table_accuracy = classification_report(y_test, pred)
    print(table_accuracy.splitlines())
    classification_matrix = create_classification_report(table_accuracy, y_test, pred, label_name)
    print('train == ', train_accuracy)
    print('test == ', test_accuracy)
    print('Class matrix == ', classification_matrix)

    y_scores = model.predict_proba(X_test)
    y_onehot = pd.get_dummies(y_test, columns=model.classes_)
    # pickle.dump(model, open(check_filename(filename), 'wb'))

    return cm_model, test_accuracy, train_accuracy, y_onehot, y_scores, classification_matrix, table_accuracy, targets_org

def confidence_interval(s, n, z=1.96):
  down = (s + z*z/(2*n) - z*math.sqrt((s*(1-s)+z*z/(4*n))/n))/(1+z*z/n)
  up = (s + z*z/(2*n) + z*math.sqrt((s*(1-s)+z*z/(4*n))/n))/(1+z*z/n)
  return down, up

def create_classification_report(table_accuracy, y_test, pred, label_name):
    """Create matrix with columns:
    'Sensitivity' --> SE = TP/(TP+FN)
    'Specificity' --> SP = FP/(FP+TN)
    'PPV' --> PPV = TP/(TP+FP)
    'NNV' --> NPV = TN/(TN+FN)
    """
    print('Start create classification table...')
    print("Table accuracy == ", table_accuracy)
    uniq_vals = list(set(y_test))
    print("uniq values == ", uniq_vals)
    intervals = []
    dict_results = {k: {'TP': 0, 'TN': 0, 'FP': 0, 'FN': 0} for k in uniq_vals}
    for label in uniq_vals:
        for expect, fact in zip(y_test, pred):
            if label == expect and expect == fact:
                dict_results[label]['TP'] += 1
            elif label != expect and label != fact:
                dict_results[label]['TN'] += 1
            elif label != expect and label == fact:
                dict_results[label]['FP'] += 1
            elif label == expect and label != fact:
                dict_results[label]['FN'] += 1
    print("словарь результатов == ", dict_results)

    table_strings = table_accuracy.splitlines()
    table_strings = [[el for el in s.split(' ') if el != ''] for s in table_strings if s != '']
    table_strings[0] = ['label'] + table_strings[0] + ['SE', 'SP', 'PPV', 'NPV']
    classification_matrix = {}
    for i, (k, v) in enumerate(dict_results.items()):
        print(k, v)
        try:
            SE = v['TP'] / (v['TP'] + v['FN'])
        except ZeroDivisionError:
            SE = 0
        try:
            SE_min, SE_max = confidence_interval(SE, v['TP'] + v['FN'])
        except:
            SE_min, SE_max = 0, 0
        try:
            SP = v['FP'] / (v['FP'] + v['TN'])
        except ZeroDivisionError:
            SP = 0
        try:
            SP_min, SP_max = confidence_interval(SP, v['FP'] + v['TN'])
        except ZeroDivisionError:
            SP_min, SP_max = 0, 0
        try:
            PPV = v['TP'] / (v['TP'] + v['FP'])
        except ZeroDivisionError:
            PPV = 0
        try:
            NPV = v['TN'] / (v['TN'] + v['FN'])
        except ZeroDivisionError:
            NPV = 0
        try:
            FPR = 1 - SP
        except ZeroDivisionError:
            FPR = 0
        try:
            FNR = 1 - SE
        except ZeroDivisionError:
            FNR = 0
        try:
            FPR_min, FPR_max = confidence_interval(FPR, v['FP'] + v['TN'])
        except ZeroDivisionError:
            FPR_min, FPR_max = 0, 0
        try:
            FNR_min, FNR_max = confidence_interval(FNR, v['FP'] + v['TN'])
        except ZeroDivisionError:
            FNR_min, FNR_max = 0, 0
        try:
            PPV_min, PPV_max = confidence_interval(PPV, v['TP'] + v['FP'])
        except ZeroDivisionError:
            PPV_min, PPV_max = 0, 0
        try:
            NPV_min, NPV_max = confidence_interval(NPV, v['TN'] + v['FN'])
        except ZeroDivisionError:
            NPV_min, NPV_max = 0, 0

        try:
            OA = SP + SE
        except ZeroDivisionError:
            OA = 0
        try:
            LRP = SE / (1 - SP)
        except ZeroDivisionError:
            LRP = 0
        try:
            LRN = (1 - SE) / SP
        except ZeroDivisionError:
            LRN = 0
        try:
            DOR = SE / (1 - SP) + (1 - SE) / SP
        except ZeroDivisionError:
            DOR = 0
        classification_matrix[k] = [
            v['TP'], v['TN'], v['FP'], v['FN'],
            round(SE, 2), round(SP, 2),
            SE_min, SE_max, SP_min, SP_max,
            round(PPV, 2), round(NPV, 2), round(FPR, 2), round(FNR, 2),
            PPV_min, PPV_max, NPV_min, NPV_max,
            FPR_min, FPR_max, FNR_min, FNR_max,
            round(OA, 2), round(LRP, 2), round(LRN, 2), round(DOR, 2)
        ]
    table_strings = []
    for k, v in classification_matrix.items():
        table_strings.append([k, *v])

    table_names_columns = [
        label_name, 'TP', 'TN', 'FP', 'FN',
        'SE', 'SP', 'SE_min', 'SE_max', 'SP_min', 'SP_max',
        'PPV', 'NPV', 'FPR', 'FNR',
        'PPV_min', 'PPV_max', 'NPV_min', 'NPV_max',
        'FPR_min', 'FPR_max', 'FNR_min', 'FNR_max',
        'Overall accuracy', 'LR+', 'LR-', 'DOR']
    classification_matrix = pd.DataFrame(table_strings, columns=table_names_columns)

    print("Матрица классификации == ", classification_matrix)
    return classification_matrix

def prepare_matrix_to_grid(matrix):
    print(matrix.columns)
    print([l for l in matrix.to_dict('index').values()])
    return [l for l in matrix.to_dict('index').values()], [{'field': c} for c in matrix.columns]


def prepare_y_scores_to_js(y_scores, y_onehot):
    results = [[] for y in y_onehot]
    labels = []
    i = 0
    for i, result in zip(range(y_scores.shape[1]), results):
        print(i)
        y_true = y_onehot.iloc[:, i]
        y_score = y_scores[:, i]

        fpr, tpr, _ = roc_curve(y_true, y_score)
        auc_score = roc_auc_score(y_true, y_score)

        name = f"{y_onehot.columns[i]} (AUC={auc_score:.2f})"
        result.append(tpr.tolist())
        result.append(fpr.tolist())
        result.append(name)
        labels.append(str(y_onehot.columns[i]) + "<br />")

    print(labels)
    return results, labels