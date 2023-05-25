from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    # Загрузка датасета
    path('datasets/upload', DatesetUploadView.as_view(), name='upload'),

    # Разделы для анализа и обучения датасета
    path('dataset/viewer', DatasetViewerView.as_view(), name='viewer'),
    path('dataset/statistic', DatasetStatistic.as_view(), name='learner'),
    path('dataset/learner', DatasetLearnerView.as_view(), name='learner'),

]