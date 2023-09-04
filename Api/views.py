from flask import Blueprint, current_app, jsonify, request
from flask import send_file
import json
import os
import time
import pandas as pd

import redis

from .utils import *

analise = Blueprint('analise', __name__)


@analise.route('/', methods=['GET'])
def check_status():
    return jsonify({'status': 'Work'}), 200

@analise.route('/learner', methods=['POST'])
def learner():
    current_app.logger.info(f'Connected to learning model SVM...')
    print(request.json)
    r_data = request.json

    dataset = load_data(r_data['dataset'], r_data['target'], *r_data['categorical_columns'], *r_data['number_columns'])
    labels = sort_data(dataset, r_data['categorical_columns'], r_data['number_columns'])
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
        # 'path': request.data['model_path'],
        # 'size': os.stat(request.data['model_path']).st_size,
    }
    return jsonify(data), 200