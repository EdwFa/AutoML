from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    # Загрузка датасета
    # path('datasets/upload', DatesetsView.as_view(), name='upload'),
    path('datasets/upload', upload_dataset, name='upload'),
    path('statistic/upload', upload_statistic, name='upload'),

    # Разделы для анализа и обучения датасета
    path('dataset/viewer', get_dataset, name='viewer'),
    path('dataset/statistic', get_statistic, name='statistic'),
    path('dataset/learner', learn_model, name='learner'),
    path('dataset/models', get_models, name='learner'),

]