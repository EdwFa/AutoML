import os

from flask import Flask
import logging
from dotenv import load_dotenv
from flask_cors import CORS

from Api import analise, check_models

load_dotenv()

class Config:
    """
    The Config class stores configuration settings for the application.
    These settings include the server host, port, debug mode, and any other
    application-specific configurations that may be controlled via environment variables.
    """

    HOST = os.getenv('HOST', '127.0.0.1')
    PORT = int(os.getenv('PORT', '5000'))
    DEBUG = True  # Set to False in production
    # Add other configurations here

def create_app():
    """
    Creates and configures an instance of the Flask application.

    Returns:
        Flask app: The configured Flask application instance.
    """
    if not os.path.exists('models'):
        os.mkdir('models')

    app = Flask(__name__, static_url_path='')
    app.config.from_object(Config)

    # Register blueprints
    app.register_blueprint(analise)

    # Configure CORS with default settings
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Logging configuration
    logging.basicConfig(filename='INFO.log', level=logging.DEBUG)

    return app


if __name__ == '__main__':
    flask_app = create_app()
    flask_app.logger.info('-----------------')
    flask_app.logger.info(f'Starting on address {address_host}:{address_port}...')

    address_host = os.getenv('HOST', '127.0.0.1')
    address_port = os.getenv('PORT', '5001')
    flask_app.run(debug=True, host=address_host, port=address_port)
