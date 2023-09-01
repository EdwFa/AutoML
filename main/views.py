from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.decorators import parser_classes, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

from adrf.decorators import api_view

import logging
import requests
import json
import os.path
import asyncio
from datetime import datetime
from aiohttp import ClientSession
import aiohttp

from ML_Datamed.settings import HOST_TO_CONNECT_LEARNER, HOST_TO_CONNECT_STATISTIC, redis_cli
from .serializers import *
from .utils import *


User = get_user_model()
logger = logging.getLogger(__name__)

allowed_types = ['csv', 'xlsx']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_datasets(request):
    if not request.user.is_active:
        return Response(data={'status': 'is not active'}, status=403)
    if request.user.is_superuser:
        datasets = Dataset.objects.all()
    else:
        datasets = Dataset.objects.filter(user=request.user)
    datasets = DatasetSerializer(datasets, many=True).data
    return Response(data={'status': 'success', 'datasets': datasets}, status=403)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@parser_classes([MultiPartParser, FormParser, FileUploadParser])
def upload_dataset(request):
    dataset = request.FILES.get('file')
    dataset_name = ''.join(dataset.name.split('.')[:-1])
    dataset_type = dataset.name.split('.')[-1]

    data = {
        'status': '',
        'name': dataset.name
    }

    if dataset_type not in allowed_types:
        data['status'] = 'Not allowed type of file'
        return Response(data=data, status=403)

    logger.debug(dataset)
    path_to_save_folder = os.path.join('datasets', request.user.username, dataset_name)
    if not os.path.exists(path_to_save_folder):
        os.mkdir(path_to_save_folder)
    dataset_full_path = os.path.join(path_to_save_folder, dataset.name)

    if os.path.exists(dataset_full_path):
        data['status'] = 'Already Exists'
        return Response(data=data, status=201)
    dataset_table = Dataset(
        name=dataset_name,
        user=request.user,
        size=dataset.size,
        format=dataset_type,
        path=path_to_save_folder
    )
    dataset_table.save(dataset)
    default_storage.save(dataset_full_path, dataset)
    data['status'] = 'Created'
    return Response(data=data, status=201)


def get_dataset_obj(request):
    datasetName = request.GET.get('datasetName')
    datasetType = request.GET.get('datasetType')
    logger.info(datasetName)
    try:
        dataset = Dataset.objects.get(name=datasetName, format=datasetType, user=request.user)
    except ObjectDoesNotExist:
        return None
    else:
        return dataset


async def get_dataset_obj_async(request):
    datasetName = request.GET.get('datasetName')
    datasetType = request.GET.get('datasetType')
    logger.info(datasetName)
    try:
        dataset = await Dataset.objects.aget(name=datasetName, format=datasetType, user=request.user)
    except ObjectDoesNotExist:
        return None
    else:
        return dataset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_dataset(request):
    dataset = get_dataset_obj(request)
    if dataset is None:
        return Response(data='Error', status=404)
    data, columns, count_rows, counts_columns = read_dataset_file(dataset)
    data = {
        'dataset': data,
        'columns': columns,
        'count_rows': count_rows,
        'count_columns': counts_columns
    }
    return Response(data=data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_statistic(request):
    dataset = get_dataset_obj(request)
    if dataset is None:
        return Response(data='Error', status=404)
    statistic_file = os.path.join(dataset.path, 'statistic.html')
    if not os.path.exists(statistic_file):
        return Response(data='Error', status=404)
    with open(statistic_file, 'r') as fs:

        data = {
            # "data": get_statistic_info(dataset)
            'data': fs.read()
        }
    return Response(data=data, status=200)

async def stat_response(**kwargs):
    async with aiohttp.ClientSession() as session:
        response = await session.post(f'{HOST_TO_CONNECT_STATISTIC}/create_stat', json=kwargs['json_data'], headers={'User-Agent': 'Mozilla/5.0'})
        if response.status > 299:
            return 500

        statistic_file = os.path.join(kwargs['path'], 'statistic.html')
        stat = await response.read()
        print(stat)
        with open(statistic_file, 'wb') as fs:
            fs.write(stat)
        return 200


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
async def upload_statistic(request):
    print(request.user)
    dataset = await get_dataset_obj_async(request)
    if dataset is None:
        return Response(data='Error', status=404)
    dataset_table = read_dataset_file(dataset)
    status_response = await stat_response(json_data={'dataset': dataset_table[0], 'title': dataset.name}, path=dataset.path)
    if status_response == 200:
        return Response(data={'success'}, status=200)
    else:
        return Response(data={'error'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_models(request):
    dataset = get_dataset_obj(request)
    if dataset is None:
        return Response(data='Error', status=403)
    _, columns, _, _ = read_dataset_file(dataset)
    data = {
        'models': default_models,
        'labels': [{'id': i, 'name': col['field']} for i, col in enumerate(columns)]
    }
    return Response(data=data, status=200)


async def learn_response(**kwargs):
    async with aiohttp.ClientSession() as session:
        response = await session.post(
            f'{HOST_TO_CONNECT_LEARNER}/learner',
            json=kwargs['json_data'],
            headers={'User-Agent': 'Mozilla/5.0'}
        )

        if response.status > 299:
            logger.info(await response.text())
            return None
        return await response.json()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
async def learn_model(request):
    dataset = await get_dataset_obj_async(request)
    if dataset is None:
        return Response(data='Error', status=403)
    headers = {
        'Content-Type': 'application/json'
    }
    type_model = request.data["model"]["name"]
    broker_key = f'ml_{request.user.username}_{dataset.name}_{type_model}'

    send_data = create_info_request(dataset, type_model, request, broker_key)

    redis_cli.set(broker_key, 'Use')

    response = await learn_response(json_data=send_data, headers=headers)
    if response is None:
        return Response(data={'status': 'error'}, status=500)
    return Response(data=response, status=201)

