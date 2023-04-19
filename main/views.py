import os.path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from django.core.files.storage import default_storage

from pprint import pprint
import logging
import requests

from .serializers import *
from .utils import *


User = get_user_model()
logger = logging.getLogger(__name__)


class DatasetView(APIView):

    def get(self, request):
        logger.debug(f'Connected user {request.user.username}...')
        if request.user.is_superuser:
            datasets = Dataset.objects.all()
        else:
            datasets = Dataset.objects.filter(user=request.user)
        data = {
            'datasets': DatasetSerializer(datasets, many=True).data
        }
        return Response(data=data, status=200)


class DatesetUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser, FileUploadParser]

    def post(self, request):
        dataset = request.FILES.get('file')
        logger.debug(dataset)
        path_to_save_folder = os.path.join('datasets', request.user.username)
        if not os.path.exists(path_to_save_folder):
            os.mkdir(path_to_save_folder)
        dataset_full_path = os.path.join(path_to_save_folder, dataset.name)
        if os.path.exists(dataset_full_path):
            return Response(data='Already Exists', status=201)
        dataset_table = Dataset(
            name=''.join(dataset.name.split('.')[:-1]),
            user=request.user,
            size=dataset.size,
            format=dataset.name.split('.')[-1],
            path=dataset_full_path
        )
        dataset_table.save()
        default_storage.save(dataset_full_path, dataset)
        return Response(data='Success', status=201)



class DatasetDetailView(APIView):
    def get(self, request, dataset_id):
        dataset = Dataset.objects.get(id=dataset_id)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        data = {
            'info': DatasetSerializer(Dataset.objects.get(id=dataset_id), many=False).data,
        }
        return Response(data=data, status=200)


class DatasetViewerView(APIView):
    def get(self, request, dataset_id):
        dataset = Dataset.objects.get(id=dataset_id)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        data, columns, count_rows, counts_columns = read_dataset_file(dataset)
        data = {
            'dataset': data,
            'columns': columns,
            'count_rows': count_rows,
            'count_columns': counts_columns
        }
        return Response(data=data, status=200)


class DatasetLearnerView(APIView):
    def get(self, request, dataset_id):
        dataset = Dataset.objects.get(id=dataset_id)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        data = {
            'models': DefaultNetworkSerializer(DefaultNetwork.objects.all(), many=True).data
        }
        for net in data['models']:
            for param in net['param']:
                print(param)
                if param['choices_values']:
                    param['choices_values'] = param['choices_values'].split(' ')
        return Response(data=data, status=200)

    def post(self, request, dataset_id):
        dataset = Dataset.objects.get(id=dataset_id)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        print(request.data)
        r = requests.get('http://localhost:7000/models/svm')
        print(r.status_code, r.json())
        data = {'status': 'succes'}
        return Response(data=data, status=201)

