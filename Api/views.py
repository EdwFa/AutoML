from flask import Blueprint, current_app, jsonify, request
from flask import send_file
import json
import os
import time
import pandas as pd
import redis
from dotenv import load_dotenv

from .utils import *


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
    current_app.logger.info(f'Connected to learning model SVM...')
    broker_key = request.args.get('broker_key')
    r_data = redis_cli.hgetall(broker_key)
    r_data['number_columns'] = r_data['number_columns'].split(',') if r_data['number_columns'] != "" else []
    r_data['categorical_columns'] = r_data['categorical_columns'].split(',') if r_data['categorical_columns'] != "" else []
    data = request.files
    print(data)
    if 'key' not in data:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    current_app.logger.info(f'Find dataset and convert them to pandas DataFrame...')

    dataset = load_data(data['key'], r_data['target'], *r_data['categorical_columns'], *r_data['number_columns'])
    labels = sort_data(dataset, r_data['categorical_columns'], r_data['number_columns'])
    labels[r_data['target']]['use'] = False
    X_train, y_train, X_test, y_test = preprocess_data(dataset, dataset[r_data['target']].copy(), labels)
    cm_model, test_accuracy, train_accuracy, y_onehot, y_scores, classification_matrix, table_accuracy, targets_org = trainer(
        X_train, y_train, X_test, y_test, r_data['model_name'],
        label_name=r_data['target'])
    print('Train accuracy = ', round(train_accuracy, 2))
    print('Test accuracy = ', round(test_accuracy, 2))
    print(classification_matrix)
    classification_matrix, columns = prepare_matrix_to_grid(classification_matrix)
    y_scores, y_labels = prepare_y_scores_to_js(y_scores, y_onehot)

    data = {
        'train_accuracy': round(train_accuracy, 2),
        'test_accuracy': round(test_accuracy, 2),
        'classification_matrix': classification_matrix,
        'columns': columns,
        'y_scores': y_scores,
        'y_onehot': y_labels,
        'cm_model': cm_model.tolist(),
    }
    return jsonify(data), 200