import os

from flask import Flask
import logging
from dotenv import load_dotenv

from Api import analise, check_models

load_dotenv()


app = Flask(__name__, static_url_path='')
app.register_blueprint(analise)
app.logger.name = 'StatisticMLApi'
address_host = os.getenv('HOST')
address_port = os.getenv('PORT')

if not os.path.exists('models'):
    os.mkdir('models')

if __name__ == '__main__':
    logging.basicConfig(filename='INFO.log', level=logging.DEBUG)
    app.logger.info('-----------------')
    app.logger.info(f'Starting on address {address_host}:{address_port}...')

    app.run(debug=True, host=address_host, port=address_port)