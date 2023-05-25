from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    path('datasets', DatasetView.as_view(), name='datasets'),
    path('datasets/upload', DatesetUploadView.as_view(), name='upload'),
    path('dataset/details', DatasetDetailView.as_view(), name='dataset'),
    path('dataset/viewer', DatasetViewerView.as_view(), name='viewer'),
    path('dataset/statistic', DatasetStatistic.as_view(), name='learner'),
    path('dataset/learner', DatasetLearnerView.as_view(), name='learner'),

    path('models/save_model', SaveModelView.as_view(), name='save-model'),
    path('models/use_model', UseModelView.as_view(), name='use-model'),
]