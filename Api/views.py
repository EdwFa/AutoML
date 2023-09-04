from flask import Blueprint, current_app, jsonify, request
from flask import send_file
import json
import os
import time
import pandas as pd
from ydata_profiling import ProfileReport

# import redis


analise = Blueprint('analise', __name__)


@analise.route('/', methods=['GET'])
def check_status():
    return jsonify({'status': 'Work'}), 200

@analise.route('/create_stat', methods=['POST'])
def createStat():
    current_app.logger.info(f'Start create statistic data...')
    data = request.json
    if 'dataset' not in data:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    current_app.logger.info(f'Find dataset and convert them to pandas DataFrame...')
    dataset = pd.DataFrame.from_records(data['dataset'])
    if 'ID' in dataset.columns:
        dataset = dataset.drop(['ID'], axis=1)
    elif 'id' in dataset.columns:
        dataset = dataset.drop(['id'], axis=1)
    current_app.logger.info(f'{dataset.shape[0]} {dataset.shape[1]}')
    title = dataset.get('title', 'Statistic')
    current_app.logger.info(f'Title -> {title}')
    profile = ProfileReport(
        dataset, title=title, html={"style": {"full_width": True}}, sort=None
    )
    current_app.logger.info(f'Save dataset...')
    save_file = "report.html"
    profile.to_file(save_file)
    current_app.logger.info(f'Response dataset...')
    return send_file(save_file, as_attachment=True)