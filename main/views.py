import json

from rest_framework.response import Response
from rest_framework.decorators import parser_classes, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

from adrf.decorators import api_view

import logging
import os.path
import asyncio
import aiohttp

from ML_Datamed.settings import HOST_TO_CONNECT_LEARNER, HOST_TO_CONNECT_STATISTIC, redis_cli
from .serializers import *
from .utils import *


User = get_user_model()
logger = logging.getLogger(__name__)

allowed_types = ['csv', 'xlsx', 'xls']

time_out_time_learn = 5 * 60
time_out_time_stat = 10 * 60


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_datasets(request):
    if not request.user.is_active:
        return Response(data={'status': 'is not active'}, status=403)
    datasets = Dataset.objects.filter(user=request.user).select_related('user')
    datasets = DatasetSerializer(datasets, many=True).data
    return Response(data={'status': 'success', 'datasets': datasets}, status=200)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def delete_dataset(request):
    dataset = get_dataset_obj(request)
    if dataset is None:
        return Response(data={'status': 'error'}, status=404)
    dataset.delete()
    return Response(data={'status': 'success'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@parser_classes([MultiPartParser, FormParser, FileUploadParser])
def update_dataset(request):
    dataset = request.FILES.get('file')
    dataset_name = ''.join(dataset.name.split('.')[:-1])
    dataset_type = dataset.name.split('.')[-1]
    logger.debug(dataset)

    data = {
        'status': '',
        'name': dataset.name
    }

    dataset_table = get_dataset_obj(request)
    if dataset_table is None:
        return Response(data={'status': 'error'}, status=404)

    if dataset_type == 'csv':
        file = pd.read_csv(dataset)
    else:
        e = f'Not valid format "{dataset_type}"'
        print(e)
        raise Exception(e)
    file.to_csv(dataset_table.get_dataset_path(), index=False)

    data['status'] = 'Created'
    return Response(data=data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@parser_classes([MultiPartParser, FormParser, FileUploadParser])
def update_dataset_table(request):
    dataset_table = get_dataset_obj(request)
    if dataset_table is None:
        return Response(data={'status': 'error'}, status=404)

    if 'info' not in request.data:
        return Response(data={'status': 'error'}, status=403)

    dataset_table.info = request.data['info']
    dataset_table.save()
    data = {'status': ''}

    data['status'] = 'Created'
    return Response(data=data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@parser_classes([MultiPartParser, FormParser, FileUploadParser])
def upload_dataset(request):
    dataset = request.FILES.get('file')
    dataset_name = '.'.join(dataset.name.split('.')[:-1])
    dataset_type = dataset.name.split('.')[-1]

    data = {
        'status': '',
        'name': dataset.name
    }

    if dataset_type not in allowed_types:
        data['status'] = 'Not allowed type of file'
        return Response(data=data, status=403)

    logger.debug(dataset)
    dataset_table = Dataset(
        name=dataset_name,
        user=request.user,
        size=dataset.size,
        format=dataset_type,
        info=dataset_name,
        path='/'
    )
    dataset_table.save()
    path_to_save_folder = os.path.join('datasets', request.user.username, f'{dataset_table.id}_{dataset_table.name}')
    dataset_table.path = path_to_save_folder
    if not os.path.exists(path_to_save_folder):
        os.mkdir(path_to_save_folder)
    dataset_full_path = os.path.join(path_to_save_folder, f'{dataset_table.id}_{dataset_table.name}.csv')
    dataset_table.save()
    if dataset_type == 'csv':
        file = pd.read_csv(dataset)
    elif dataset_type == 'xlsx' or 'xls':
        file = pd.read_excel(dataset)
    else:
        e = f'Not valid format "{dataset_type}"'
        print(e)
        raise Exception(e)
    file.to_csv(dataset_full_path, index=False)

    data['status'] = 'Created'
    return Response(data=data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_dataset(request):
    dataset = get_dataset_obj(request)
    if dataset is None:
        return Response(data='Error', status=404)
    data, columns, count_rows, counts_columns, dtypes = read_dataset_file(dataset)
    data = {
        'dataset': data,
        'columns': [
            {
                'field': col,
                'filter': get_grid_type(dtype),
                'sortable': True,
                'enableRowGroup': True,
                'enableValue': True,
                'resizable': True,
                'editable': True,
                'width': 90,
                'minWidth': 50,
            }
            for col, dtype in zip(columns, dtypes)
        ],
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

async def stat_response(dataset):
    timeout = aiohttp.ClientTimeout(total=time_out_time_stat)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        with open(dataset.get_dataset_path(), 'r') as f:
            try:
                response = await session.post(f'{HOST_TO_CONNECT_STATISTIC}/create_stat', data={'key': f},
                                           headers={'User-Agent': 'Mozilla/5.0'})
            except asyncio.exceptions.TimeoutError:
                print("time out exception")
                return 504

        if response.status > 299:
            return 500

        statistic_file = dataset.get_stat_path()
        stat = await response.read()
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

    status_response = await stat_response(dataset)
    if status_response == 504:
        return Response(data={'timeout'}, status=504)
    elif status_response == 200:
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
    _, columns, _, _, types = read_dataset_file(dataset)
    data = {
        'models': default_models,
        'labels': [
            {'id': i, 'name': col, 'number': (dtype == 'int' or dtype == 'float')}
        for i, (col, dtype) in enumerate(zip(columns, types))]
    }
    models = list()
    for model in data['models']:
        models.append({'label': model, 'value': None})
        if not os.path.exists(f'documents/base_models/{model}.json'):
            continue
        models[-1]['value'] = json.load(open(f'documents/base_models/{model}.json'))
    data['models'] = models
    return Response(data=data, status=200)


async def learn_response(**kwargs):
    timeout = aiohttp.ClientTimeout(total=time_out_time_learn)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        with open(kwargs['dataset'].get_dataset_path(), 'r') as f:
            try:
                response = await session.post(
                    f'{HOST_TO_CONNECT_LEARNER}/learner?broker_key={kwargs["key"]}',
                    data={'key': f},
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
            except asyncio.exceptions.TimeoutError:
                print("time out exception")
                return 504, None

        if response.status > 299:
            return 500, await response.json()
        return 200, await response.json()

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
    type_model = request.data.get("model", "")
    if type_model == "":
        return Response(data={'status': 'error'}, status=500)
    params = [{param['param']: param['default_value']['value'] if isinstance(param['default_value'], dict) else param['default_value'] for param in m['value']} if m['value'] else None for m in type_model]
    print(params)

    type_model = ','.join([m['label'] for m in type_model])
    broker_key = f'ml_{request.user.username}_{dataset.id}'

    send_data = create_info_request(request, type_model, params)
    redis_cli.hset(broker_key, mapping=send_data)

    response_status, response = await learn_response(dataset=dataset, headers=headers, key=broker_key)
    redis_cli.delete(broker_key)
    if response_status == 500:
        return Response(data=response, status=201)
    elif response_status == 504:
        return Response(data={'status': 'error'}, status=504)
    return Response(data=response, status=201)


async def save_response(user, model_name):
    timeout = aiohttp.ClientTimeout(total=time_out_time_learn)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        try:
            response = await session.post(
                f'{HOST_TO_CONNECT_LEARNER}/saver?user={user.username}&model={model_name}',
                headers={'User-Agent': 'Mozilla/5.0'}
            )
        except asyncio.exceptions.TimeoutError:
            print("time out exception")
            return 504, None

        if response.status > 299:
            return 500, await response.json()
        return 200, await response.read()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
async def save_model(request):
    print(request.data)
    response_status, response = await save_response(request.user, request.data['model'])
    print(response)
    if response_status == 500:
        return Response(data=response, status=201)
    elif response_status == 504:
        return Response(data={'status': 504}, status=504)

    configs = request.data['columns']
    print([t.rstrip("<br />") for t in request.data['target_info']])
    configs.append([request.data['target'], *[t.rstrip("<br />") for t in request.data['target_info']]])
    new_model = LearnModel(name=request.data['model'], user=request.user, configs=request.data['columns'])
    await new_model.asave()
    # dump(response, os.path.join('models', request.user.username, f'{new_model.id}.sav'))
    with open(os.path.join('models', request.user.username, f'{new_model.id}.sav'), 'wb') as f:
        f.write(response)

    return Response(data={'status': 200}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_user_models(request):
    if not request.user.is_active:
        return Response(data={'status': 'is not active'}, status=403)
    models = LearnModel.objects.filter(user=request.user).select_related('user')
    models = LearnModelSerializer(models, many=True).data
    return Response(data={'status': 'success', 'models': models}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_model_configs(request):
    if not request.user.is_active:
        return Response(data={'status': 'is not active'}, status=403)
    model = LearnModel.objects.get(id=request.GET.get('modelId'))
    print(model.configs)
    return Response(data={'status': 'success', 'configs': model.configs}, status=200)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def update_model(request):
    if not request.user.is_active:
        return Response(data={'status': 'is not active'}, status=403)
    model = LearnModel.objects.get(id=request.GET.get('modelId'))
    model.name = request.data.get('modelName', model.name)
    model.info = request.data.get('modelInfo', model.info)
    model.save()
    return Response(data={'status': 'success'}, status=200)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def delete_model(request):
    if not request.user.is_active:
        return Response(data={'status': 'is not active'}, status=403)
    model_id = request.GET.get('modelId', None)
    if model_id is None:
        return Response(data={'status': 'Not Found'}, status=404)
    model = LearnModel.objects.get(id=model_id)
    model.delete()
    return Response(data={'status': 'success'}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def predict_model(request):
    print(request.data)
    print(request.GET.get('modelId'))
    try:
        prediction = predict(request.data, request.GET.get('modelId'))
    except Exception as e:
        return Response(data={'status': 500, 'error': str(e)}, status=500)
    return Response(data={'status': 200, 'prediction': prediction}, status=200)