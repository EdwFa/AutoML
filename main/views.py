import os.path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from django.core.files.storage import default_storage

from pprint import pprint
import logging

from .utils import *


logger = logging.getLogger(__name__)


class SVMLearnerView(APIView):

    def post(self, request):
        logger.debug(f'Connected to learning model SVM...')
        print(request.data)
        dataset = load_data(request.data['dataset_path'], request.data['dataset_name'])
        labels = sort_data(dataset)
        X_train, y_train, X_test, y_test = preprocess_data(dataset, dataset[request.data['target']].copy(), labels)
        cm_model, test_accuracy, train_accuracy, y_onehot, y_scores, classification_matrix, table_accuracy, targets_org = trainer(
            X_train, y_train, X_test, y_test, 'SVM', label_name=request.data['target'])
        print('Train accuracy = ', round(train_accuracy, 2))
        print('Test accuracy = ', round(test_accuracy, 2))
        print(classification_matrix)
        classification_matrix, columns = prepare_matrix_to_grid(classification_matrix)

        data = {
            'train_accuracy': round(train_accuracy, 2),
            'test_accuracy': round(test_accuracy, 2),
            'classification_matrix': classification_matrix,
            'columns': columns
        }
        return Response(data=data, status=200)

