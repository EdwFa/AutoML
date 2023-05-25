import os.path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from django.core.files.storage import default_storage

from pprint import pprint
import logging
import requests
import json

from ML_Datamed.settings import HOST_TO_CONNECT_LEARNER
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

        data = {
            'status': '',
            'name': dataset.name
        }
        if os.path.exists(dataset_full_path):
            data['status'] = 'Already Exists'
            return Response(data=data, status=201)
        dataset_table = Dataset(
            name=''.join(dataset.name.split('.')[:-1]),
            user=request.user,
            size=dataset.size,
            format=dataset.name.split('.')[-1],
            path=dataset_full_path
        )
        dataset_table.save()
        default_storage.save(dataset_full_path, dataset)
        data['status'] = 'Created'
        return Response(data=data, status=201)

def get_dataset(request):
    datasetName = request.GET.get('datasetName')
    print(datasetName)
    dataset = Dataset.objects.get(name=''.join(datasetName.split('.')[:-1]), user=request.user)
    return dataset

class DatasetDetailView(APIView):
    def get(self, request):
        dataset = get_dataset(request)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        data = {
            'info': DatasetSerializer(dataset, many=False).data,
        }
        return Response(data=data, status=200)

class DatasetViewerView(APIView):
    def get(self, request):
        dataset = get_dataset(request)
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

class DatasetStatistic(APIView):

    def get(self, request):
        dataset = get_dataset(request)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        data = {
            "data": get_statistic_info(dataset)
        }
        return Response(data=data, status=200)


class DatasetLearnerView(APIView):
    def get(self, request):
        dataset = get_dataset(request)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)
        _, columns, _, _ = read_dataset_file(dataset)
        data = {
            'models': DefaultNetworkSerializer(DefaultNetwork.objects.all(), many=True).data,
            'labels': [{'id': i, 'name': col['field']} for i, col in enumerate(columns)]
        }
        for net in data['models']:
            for param in net['param']:
                print(param)
                if param['choices_values']:
                    param['choices_values'] = param['choices_values'].split(' ')
        return Response(data=data, status=200)

    def post(self, request):
        dataset = get_dataset(request)
        if (not request.user.is_superuser) or (request.user.username != dataset.user.username):
            return Response(data='Error', status=401)

        headers = {
            # 'authorization': f{'token_type'}.encode('utf-8')+' '+f['access_token'].encode('utf-8'),
            'Content-Type': 'application/json'
        }
        new_model = Networks.objects.create(dataset=dataset, default_model=DefaultNetwork.objects.get(
            name=request.data["model"]["name"]))
        send_data = json.dumps(create_info_request(dataset, new_model, request))
        r = requests.post(f'{HOST_TO_CONNECT_LEARNER}/models/learn', data=send_data, headers=headers)
        print(r.status_code, r.json())
        new_model.path = r.json()['path']
        # new_model.size = r.json()['size']
        new_model.save()
        data = r.json()
        data['model_id'] = new_model.id
        return Response(data=data, status=201)

class SaveModelView(APIView):
    def post(self, request):
        new_model = Networks.objects.get(id=request.data['model_id'])
        if request.user.id != new_model.dataset.user.id:
            return Response(data='Not allow', status=403)
        if new_model.saved:
            return Response(data='Already saved', status=403)
        new_model.saved = True
        new_model.save()
        return Response(data='Success', status=201)


class UseModelView(APIView):
    def get(self, request):
        data = {'data': ""}
        return Response(data=data, status=200)

