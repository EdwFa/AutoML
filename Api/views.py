from flask import Blueprint, current_app, jsonify, request
from flask import send_file
import pandas as pd
import seaborn as sns
from ydata_profiling import ProfileReport

# import redis
from .utils import TranslateStat


analise = Blueprint('analise', __name__)


@analise.route('/', methods=['GET'])
def check_status():
    return jsonify({'status': 'Work'}), 200

@analise.route('/create_stat', methods=['POST'])
def createStat():
    current_app.logger.info(f'Start create statistic data...')
    save_file = "report.html"
    data = request.files
    print(data)
    if 'key' not in data:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    current_app.logger.info(f'Find dataset and convert them to pandas DataFrame...')
    dataset = pd.read_csv(data['key'].stream)
    current_app.logger.info(f'{dataset.shape[0]} {dataset.shape[1]}')
    title = dataset.get('title', 'Statistic')
    current_app.logger.info(f'Title -> {title}')
    profile = ProfileReport(
        dataset, title=title, html={"style": {"full_width": True}}, sort=None
    )
    current_app.logger.info(f'Save dataset...')
    profile.to_file(save_file)
    translateHTML = TranslateStat(save_file)
    translateHTML.translate()
    translateHTML.reload_changes(save_file)
    translateHTML.change_raw_file(save_file)
    current_app.logger.info(f'Response dataset...')
    return send_file(save_file, as_attachment=True)


@analise.route('/create_graphics', methods=['POST'])
def createGraphics():
    current_app.logger.info(f'Start create graphics data...')
    data = request.files
    save_file = "image.jpeg"
    print(data)
    if 'key' not in data:
        return jsonify({'status': 'Error', 'message': 'No found dataset!'}), 500
    current_app.logger.info(f'Find dataset and convert them to pandas DataFrame...')
    dataset = pd.read_csv(data['key'].stream)
    current_app.logger.info(f'{dataset.shape[0]} {dataset.shape[1]}')

    g = sns.PairGrid(dataset)
    g.map_upper(sns.histplot)
    g.map_lower(sns.kdeplot, fill=True)
    g.map_diag(sns.histplot, kde=True)
    g.figure.savefig(save_file)
    current_app.logger.info(f'Response dataset...')
    return send_file(save_file, as_attachment=True)