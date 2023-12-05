import os.path

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import HistGradientBoostingClassifier
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


models = {
    'SVM': SVC,
    'Decision Tree': DecisionTreeClassifier,
    'RandomForestClassifier': RandomForestClassifier,
    'LogisticRegression': LogisticRegression,
    'GradientBoostingClassifier': GradientBoostingClassifier,
    'AdaBoostClassifier': AdaBoostClassifier,
    'KNeighborsClassifier': KNeighborsClassifier,
    'ExtraTreesClassifier': ExtraTreesClassifier,
    'MLPClassifier': MLPClassifier,
    'HistGradientBoostingClassifier': HistGradientBoostingClassifier
}
default_models = {
    'SVM': SVC(probability=True),
    'Decision Tree': DecisionTreeClassifier(),
    'RandomForestClassifier': RandomForestClassifier(),
    'LogisticRegression': LogisticRegression(max_iter=200),
    'GradientBoostingClassifier': GradientBoostingClassifier(n_estimators=100, learning_rate=1.0,
                                                             max_depth=1, random_state=0),
    'AdaBoostClassifier': AdaBoostClassifier(),
    'KNeighborsClassifier': KNeighborsClassifier(),
    'ExtraTreesClassifier': ExtraTreesClassifier(n_estimators=10, max_depth=None, min_samples_split=2, random_state=0),
    'MLPClassifier': MLPClassifier(solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(15,), random_state=1),
    'HistGradientBoostingClassifier': HistGradientBoostingClassifier(max_iter=100),
}

formats = ['csv', 'xlsx', 'xls']

def load_data(dataset, target, *labels):
    print(f'Load dataset...')
    data = pd.read_csv(dataset.stream)
    if labels is not None:
        data = data[[target, *labels]]
    print(data.columns)

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

def preprocess_data(data, target, labels, test_size=0.2):
    random_state = int(test_size * 100) % 17
    print(test_size, random_state)
    columns = []
    columns_info = []
    for label in labels:
        if labels[label]['use'] == False:
            categ_list = {category: i for i, category in enumerate(data[label].unique().tolist())}
            continue
        column = data[label].copy()
        if labels[label]['type'] == 1:
            column.fillna(column.median(), inplace=True)
            mean = column.mean()
            std = column.std()
            column = (column - mean) / std
            columns.append(column.to_numpy())
            labels[label]['count'] = 1
            columns_info.append(dict(label=label, type='num', mean=mean, std=std))
        else:
            column.fillna(column.mode().values[0], inplace=True)
            categ_list = {category: i for i, category in enumerate(data[label].unique().tolist())}
            matrix = np.zeros((column.shape[0], len(categ_list)))
            for i, val in zip(range(column.shape[0]), column):
                matrix[i, categ_list[val]] = 1
            columns.append(matrix)
            labels[label]['count'] = len(categ_list)
            params = [{'cat': k, 'val': v} for k, v in categ_list.items()]
            columns_info.append(dict(label=label, type='cat', params=params))
    columns = [column.reshape(column.shape[0], 1) if len(column.shape) == 1 else column for column in columns]
    dataset = np.concatenate(columns, axis=1)
    X_train, X_test, y_train, y_test = train_test_split(dataset, target, test_size=1-test_size, random_state=random_state)
    return X_train, y_train, X_test, y_test, columns_info


def check_filename(filename):
    file_path = '/'.join(filename.split('/')[:-1])
    print(file_path)
    if not os.path.exists(file_path):
        os.mkdir(file_path)
    return filename


def get_score_after_permutation(model, X, y, curr_feat, start_pos, count):
    """return the score of model when curr_feat is permuted"""

    X_permuted = X.copy()
    # permute one column
    X_permuted[:, start_pos:count] = np.random.permutation(
        X_permuted[:, start_pos:count]
    )

    permuted_score = model.score(X_permuted, y)
    return permuted_score


def get_feature_importance(model, X, y, curr_feat, start_pos, count):
    """compare the score when curr_feat is permuted"""

    baseline_score_train = model.score(X, y)
    permuted_score_train = get_score_after_permutation(model, X, y, curr_feat, start_pos, count)

    # feature importance is the difference between the two scores
    feature_importance = baseline_score_train - permuted_score_train
    return feature_importance


def permutation_importance(model, X, y, labels, n_repeats=10):
    """Calculate importance score for each feature."""

    importances = []
    i = 0
    f_labels = []
    for k, v in labels.items():
        if v['use'] == False:
            continue
        f_labels.append(k)
        list_feature_importance = []
        for n_round in range(n_repeats):
            list_feature_importance.append(
                get_feature_importance(model, X, y, k, i, i+v['count'])
            )
        i = i + v['count']
        importances.append(list_feature_importance)

    data = {
        "labels": f_labels,
        "importances_mean": np.mean(importances, axis=1),
        "importances_std": np.std(importances, axis=1),
        "importances": importances,
    }
    indices = data["importances_mean"].argsort()
    data["importances_mean"] = data["importances_mean"][indices].tolist()
    data["importances_std"] = data["importances_std"][indices].tolist()
    return data

def trainer(X_train, y_train, X_test, y_test, model_name, label_name, labels, **params):
    print(params)
    is_permutate = params.pop('is_permutate', False)
    if 'clear' in params:
        model = default_models[model_name]
    else:
        model = models[model_name]
        model = model(**params)

    model.fit(X_train, y_train)
    if is_permutate:
        features_importants = permutation_importance(model, X_train, y_train, labels)
    else:
        features_importants = None

    pred = model.predict(X_test)
    y_test_org = np.unique(y_test)
    targets_org = [label for label in y_test_org]
    cm_model = confusion_matrix(y_test, pred)
    train_accuracy = accuracy_score(y_train, model.predict(X_train))
    test_accuracy = accuracy_score(y_test, pred)
    table_accuracy = classification_report(y_test, pred)
    classification_matrix = create_classification_report(table_accuracy, y_test, pred, label_name)

    y_scores = model.predict_proba(X_test)
    y_onehot = pd.get_dummies(y_test, columns=model.classes_)
    # pickle.dump(model, open(check_filename(filename), 'wb'))

    return model, cm_model, test_accuracy, train_accuracy, y_onehot, y_scores, classification_matrix, table_accuracy, targets_org, features_importants

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
    uniq_vals = list(set(y_test))
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

    table_strings = table_accuracy.splitlines()
    table_strings = [[el for el in s.split(' ') if el != ''] for s in table_strings if s != '']
    table_strings[0] = ['label'] + table_strings[0] + ['SE', 'SP', 'PPV', 'NPV']
    classification_matrix = {}
    for i, (k, v) in enumerate(dict_results.items()):
        try:
            Accuracy = (v['TP'] + v['TN']) / (v['TP'] + v['TN'] + v['FP'] + v['FN'])
        except ZeroDivisionError:
            Accuracy = 0
        try:
            Precision = v['TP'] / (v['FP'] + v['TP'])
        except ZeroDivisionError:
            Precision = 0
        try:
            Recall = v['TP'] / (v['FN'] + v['TP'])
        except ZeroDivisionError:
            Recall = 0
        try:
            F1_SCORE = 2 * Precision * Recall / (Precision + Recall)
        except ZeroDivisionError:
            F1_SCORE = 0

        try:
            SE = v['TP'] / (v['TP'] + v['FN'])
        except ZeroDivisionError:
            SE = 0
        try:
            SP = v['TN'] / (v['FP'] + v['TN'])
        except ZeroDivisionError:
            SP = 0
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
            round(Accuracy, 2), round(Precision, 2), round(Recall, 2), round(F1_SCORE, 2),
            round(SE, 2), round(SP, 2),
            round(PPV, 2), round(NPV, 2), round(FPR, 2), round(FNR, 2),
            round(OA, 2), round(LRP, 2), round(LRN, 2), round(DOR, 2)
        ]
    table_strings = []
    for k, v in classification_matrix.items():
        table_strings.append([k, *v])

    table_names_columns = [
        label_name, 'TP', 'TN', 'FP', 'FN',
        'accuracy', 'precision', 'recall', 'f1-score',
        'SE', 'SP',
        'PPV', 'NPV', 'FPR', 'FNR',
        'Overall accuracy', 'LR+', 'LR-', 'DOR']
    classification_matrix = pd.DataFrame(table_strings, columns=table_names_columns)

    print("Матрица классификации == ", classification_matrix)
    return classification_matrix

def prepare_matrix_to_grid(matrix):
    return [l for l in matrix.to_dict('index').values()], [{'field': c} for c in matrix.columns]


def prepare_y_scores_to_js(y_scores, y_onehot):
    results = [[] for y in y_onehot]
    labels = []
    i = 0
    for i, result in zip(range(y_scores.shape[1]), results):
        y_true = y_onehot.iloc[:, i]
        y_score = y_scores[:, i]

        fpr, tpr, _ = roc_curve(y_true, y_score)
        auc_score = roc_auc_score(y_true, y_score)

        name = f"{y_onehot.columns[i]} (AUC={auc_score:.2f})"
        result.append(tpr.tolist())
        result.append(fpr.tolist())
        result.append(name)
        labels.append(str(y_onehot.columns[i]) + "<br />")

    return results, labels




