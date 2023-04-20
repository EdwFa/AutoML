from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    path('svm', SVMLearnerView.as_view(), name='datasets'),
]