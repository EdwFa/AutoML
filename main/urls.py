from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    path('datasets', DatasetView.as_view(), name='datasets'),
    path('datasets/upload', DatesetUploadView.as_view(), name='upload'),
    path('datasets/<int:dataset_id>', DatasetDetailView.as_view(), name='dataset'),
    path('datasets/<int:dataset_id>/viewer', DatasetViewerView.as_view(), name='viewer'),
    path('datasets/<int:dataset_id>/learner', DatasetLearnerView.as_view(), name='learner'),
]