from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, ExtraTreesClassifier
from sklearn.ensemble import GradientBoostingClassifier

from sklearn.metrics import confusion_matrix, accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from sklearn.neural_network import MLPClassifier, MLPRegressor

from sklearn.linear_model import SGDClassifier

import numpy as np
import pandas as pd


models = {
    'SVM': SVC,
    'Decision Tree': DecisionTreeClassifier(),
    'Random Forest': RandomForestClassifier(),
    'Logistic Regression': LogisticRegression(max_iter=200),
    'GradientBoostingClassifier': GradientBoostingClassifier(n_estimators=100, learning_rate=1.0,
                                                             max_depth=1, random_state=0),
    'AdaBoost': AdaBoostClassifier(),
    'KNN': KNeighborsClassifier(),
    'ExtraTrees': ExtraTreesClassifier(n_estimators=10, max_depth=None, min_samples_split=2, random_state=0),
    'MLPClassifier': MLPClassifier(solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(15,), random_state=1)
    # 'MLPRegressor': MLPRegressor(random_state=1, max_iter=500)
    # 'SGDC': SGDClassifier(loss="squared_error", penalty="l2", max_iter=5)

}

formats = ['csv', 'xlsx', 'xls']

def load_data(file, file_name):
    print(f'Load {file_name}...')
    format = file_name.split('.')[-1].lower()
    if format == formats[0]:
        data = pd.read_csv(file)
    elif format == formats[1] or format == formats[2]:
        data = pd.read_excel(file)
    else:
        raise Exception('Format is not available', file_name)
    print(data.columns)
    if 'ID' in data.columns:
        return data.drop(['ID'], axis=1)
    elif'id' in data.columns:
        return data.drop(['id'], axis=1)
    else:
        print('No one id column')
        return data


def sort_data(data, labels=None):
    if labels is None:
        labels = {}
        for label, uniqval in zip(data.columns, data.nunique()):
            info = {}
            value = data[label][0]
            try:
                int(value)
                info['type'] = 1
            except:
                try:
                    float(value)
                    info['type'] = 1
                except:
                    info['type'] = 0
            finally:
                info['uniq_vals'] = uniqval
                info['use'] = True
                labels[label] = info
        for label, nadata in zip(data.columns, data.isna().sum()):
            labels[label]['na_data'] = nadata
    else:
        for label, uniqval in zip(data.columns, data.nunique()):
            labels[label]['uniq_vals'] = uniqval
        for label, nadata in zip(data.columns, data.isna().sum()):
            labels[label]['na_data'] = nadata
    if 'ID' in data.columns:
        labels['ID']['use'] = False
    return labels

def preprocess_data(data, target, labels):
    dataset = None
    for label in labels:
        if labels[label]['use'] == False:
            print('Not Use --> ', label)
        else:
            column = data[label].copy()
            if labels[label]['type'] == 1:
                column.fillna(column.median(), inplace=True)
                mean = column.mean()
                print('mean = ', mean)
                column = column / mean
            else:
                column.fillna(column.mode().values[0], inplace=True)
                categ_list = {category: i for i, category in enumerate(data[label].unique().tolist())}
                column = column.replace(categ_list)
                print("Catefory list == ", categ_list)
            if dataset is not None:
                dataset = np.vstack([dataset, column.to_numpy()])
            else:
                dataset = np.array([[i for i in column.to_numpy()]])
    dataset = np.transpose(dataset)
    print(dataset.shape)
    X_train, X_test, y_train, y_test = train_test_split(dataset, target, test_size=0.18, random_state=401)
    return X_train, y_train, X_test, y_test


def trainer(X_train, y_train, X_test, y_test, model_name, label_name, **params):
    model = models[model_name](probability=True, **params)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    y_test_org = np.unique(y_test)
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

    return cm_model, test_accuracy, train_accuracy, y_onehot, y_scores, classification_matrix, table_accuracy, targets_org


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
            SP = v['FP'] / (v['FP'] + v['TN'])
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

        classification_matrix[k] = [round(SE, 2), round(SP, 2), round(PPV, 2), round(NPV, 2)]
        # table_strings[i+1] = table_strings[i+1] + classification_matrix[k]
    #
    # print("таблица значений == ", table_strings)
    # classification_matrix = pd.DataFrame(table_strings[1:i+2], columns=table_strings[0])
    table_strings = []
    for k, v in classification_matrix.items():
        table_strings.append([k, *v])
    table_names_columns = [label_name, 'SE', 'SP', 'PPV', 'NPV']
    classification_matrix = pd.DataFrame(table_strings, columns=table_names_columns)

    print("Матрица классификации == ", classification_matrix)
    return classification_matrix

def prepare_matrix_to_grid(matrix):
    print(matrix.columns)
    print([l for l in matrix.to_dict('index').values()])
    return [l for l in matrix.to_dict('index').values()], [{'field': c} for c in matrix.columns]