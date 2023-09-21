from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    # датасеты
    path('datasets', get_datasets),
    path('dataset/delete', delete_dataset),
    path('dataset/update', update_dataset),
    path('dataset/update_info', update_dataset_table),

    # Загрузка датасета и статистики
    path('datasets/upload', upload_dataset, name='upload'),
    path('statistic/upload', upload_statistic, name='upload'),

    # Разделы для анализа и обучения датасета
    path('dataset/viewer', get_dataset, name='viewer'),
    path('dataset/statistic', get_statistic, name='statistic'),
    path('dataset/learner', learn_model, name='learner'),
    path('dataset/models', get_models, name='learner'),

]