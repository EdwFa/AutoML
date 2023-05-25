from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'main'

urlpatterns = [
    path('learn', LearnerView.as_view(), name='datasets'),
]