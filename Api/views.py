import json
import time
from flask import Blueprint, current_app, jsonify, request
from flask import send_file
import os
import redis
import threading
from dotenv import load_dotenv

import pickle
from joblib import dump, load

from .trainer_classification import trainer, prepare_matrix_to_grid, prepare_y_scores_to_js
from .trainer_regression import trainer2
from .preprocessing import *



analise = Blueprint('analise', __name__)

load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = int(os.getenv('REDIS_PORT'))

print(f'redis on {REDIS_HOST}{REDIS_PORT}')

redis_cli = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

@analise.route('/', methods=['GET'])
def check_status():
    return jsonify({'status': 'Work'}), 200

@analise.route('/learner', methods=['POST'])
def learner():
    current_app.logger.info(f'Connected to learning model Prediction...')
    broker_key = request.args.get('broker_key')
    r_data = redis_cli.hgetall(broker_key)
    r_data['number_columns'] = r_data['number_columns'].split(';;;') if r_data['number_columns'] != "" else []
    r_data['categorical_columns'] = r_data['categorical_columns'].split(';;;') if r_data['categorical_columns'] != "" else []
    models = json.loads(r_data['model_name'])
    models_params = json.loads(r_data['params'])
    test_size = float(r_data['score'])
    count_rows = int(r_data['count'])

    user = r_data['user']
    user_folder = os.path.abspath(f'models/{user}')
    print(user_folder)
    if not os.path.exists(user_folder):
        print('DONT EXIST!!!!!!!!!!!!!!!!!!!')
        os.mkdir(user_folder)

    checker = threading.Thread(target=check_models, args=(user_folder, ))
    checker.start()

    if len(models) == 0:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    data = request.files
    print(data)
    if 'key' not in data:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    current_app.logger.info(f'Find dataset and convert them to pandas DataFrame...')

    dataset = load_data(data['key'], r_data['target'], count_rows, *r_data['categorical_columns'], *r_data['number_columns'])
    labels = sort_data(dataset, r_data['categorical_columns'], r_data['number_columns'])
    labels[r_data['target']]['use'] = False
    try:
        X_train, y_train, X_test, y_test, columns_info = preprocess_data(dataset, dataset[r_data['target']].copy(), labels, test_size)
    except Exception as e:
        print(e)
        return jsonify({'message': str(e), 'status': 500}), 500
    all_data = []
    for model_name, params in zip(models, models_params):
        print(model_name)
        if params is None:
            params = {'clear': True}
        try:
            params = {k: v for k, v in params.items() if v is not None}
            model, cm_model, test_accuracy, train_accuracy, y_onehot, y_scores, classification_matrix, table_accuracy, targets_org, features_importants = trainer(
                X_train, y_train, X_test, y_test, model_name['name'], label_name=r_data['target'], labels=labels, **params)
        except Exception as e:
            print(e)
            return jsonify({'message': str(e), 'status': 500}), 500

        print(y_onehot.columns.tolist())

        print('Train accuracy = ', round(train_accuracy, 2))
        print('Test accuracy = ', round(test_accuracy, 2))
        print(classification_matrix)
        classification_matrix, columns = prepare_matrix_to_grid(classification_matrix)
        y_scores, y_labels = prepare_y_scores_to_js(y_scores, y_onehot)

        with open(os.path.join(user_folder, f'model_{model_name["name"]}.sav'), 'wb') as f:
            dump(model, f)

        data = {
            'train_accuracy': round(train_accuracy, 2),
            'test_accuracy': round(test_accuracy, 2),
            'classification_matrix': classification_matrix,
            'columns': columns,
            'y_scores': y_scores,
            'y_onehot': y_labels,
            'cm_model': cm_model.tolist(),
            'features_importants': features_importants,
            'columns_info': columns_info,
        }
        all_data.append({"model": model_name, "data": data, "target": r_data['target']})

    return jsonify({'data': all_data, 'status': 200}), 200


@analise.route('/learner-regression', methods=['POST'])
def learner_regression():
    current_app.logger.info(f'Connected to learning model Regression...')
    # Извлечение данных из Redis
    broker_key = request.args.get('broker_key')
    r_data = redis_cli.hgetall(broker_key) # в виде словаря
    # Обновление значения ключей
    r_data['number_columns'] = r_data['number_columns'].split(';;;') if r_data['number_columns'] != "" else []
    r_data['categorical_columns'] = r_data['categorical_columns'].split(';;;') if r_data[
                                                                              'categorical_columns'] != "" else []
    # Извлечение данных из Redis
    models = json.loads(r_data['model_name'])
    models_params = json.loads(r_data['params'])
    test_size = float(r_data['score'])
    count_rows = int(r_data['count'])

    #Содание пользолвательской папки если ее нет
    user = r_data['user']
    user_folder = os.path.abspath(f'models/{user}')
    print(user_folder)
    if not os.path.exists(user_folder):
        print('DONT EXIST!!!!!!!!!!!!!!!!!!!')
        os.mkdir(user_folder)

    # Поток проверки моделей в папке пользователя
    checker = threading.Thread(target=check_models, args=(user_folder,))
    checker.start()

    if len(models) == 0:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    # Загрузка данных и перeвод в dataframe
    data = request.files
    print(data)
    if 'key' not in data:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    current_app.logger.info(f'Find dataset and convert them to pandas DataFrame...')

    dataset = load_data(data['key'], r_data['target'], count_rows, *r_data['categorical_columns'],
                        *r_data['number_columns'])
    # Создание ярлыков
    labels = sort_data(dataset, r_data['categorical_columns'], r_data['number_columns'])
    labels[r_data['target']]['use'] = False

    # Создание обучающих и тестовых наборов
    try:
        X_train, y_train, X_test, y_test, columns_info = preprocess_data(dataset, dataset[r_data['target']].copy(),
                                                                         labels, test_size)
    except Exception as e:
        print(e)
        return jsonify({'message': str(e), 'status': 500}), 500
    # Список для хранения оценочных показателей для каждой модели
    all_data = []
    # Проверка переданных параметров
    for model_name, params in zip(models, models_params):
        print(model_name)
        if params is None:
            params = {'clear': True}
        try:
            # Обучение модели
            params = {k: v for k, v in params.items() if v is not None}
            model, train_mae, train_rmse, train_mape, test_mae, test_rmse, test_mape, train_r2, test_r2, features_importants = trainer2(
                X_train, y_train, X_test, y_test, model_name['name'], labels, **params)
        except Exception as e:
            print(e)
            return jsonify({'message': str(e), 'status': 500}), 500

        print(train_mae, train_rmse, train_mape, test_mae, test_rmse, test_mape, train_r2, test_r2)
        # Сохранение обученных моделей
        with open(os.path.join(user_folder, f'model_{model_name["name"]}.sav'), 'wb') as f:
            dump(model, f)

        data = {
            'train_mae': train_mae,
            'train_rmse': train_rmse,
            'train_mape': train_mape,
            'test_mae': test_mae,
            'test_rmse': test_rmse,
            'test_mape': test_mape,
            'train_r2': train_r2,
            'test_r2': test_r2,
            'features_importants': features_importants,
            'columns_info': columns_info
        }
        all_data.append({"model": model_name, "data": data, "target": r_data['target']})

    return jsonify({'data': all_data, 'status': 200}), 200


@analise.route('/saver', methods=['POST'])
def save_model():
    print('save model')
    user = request.args.get('user')
    model_name = request.args.get('model')
    save_file = f'models/{user}/model_{model_name}.sav'
    print(save_file)
    if not os.path.exists(save_file) and not os.path.isfile(save_file):
        return jsonify({'message': "File doesnt exist", 'status': 500}), 500
    return send_file(save_file, as_attachment=True)


def check_models(*args):
    print('-------')
    print('Start checking use/useless models...')
    print('-------')
    user_folder = args[0]
    for file in os.listdir(user_folder):
        print(file)
        os.remove(os.path.join(user_folder, file))
    print('-------')
    print('Clear all useless models...')
    print('-------')