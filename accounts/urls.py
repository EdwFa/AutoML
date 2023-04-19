from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import *

app_name = 'accounts'

urlpatterns = [
    path('accounts/profile', AccountApiView.as_view(), name='profile'),
    path('accounts/login', LoginApiView.as_view(), name='login'),
    path('accounts/login_session', LoginSessionApiView.as_view(), name='login-session'),
    path('accounts/logout', LogOutApiView.as_view(), name='logout'),
    path('accounts/sign-up', RegistrationApiView.as_view(), name='sign-up'),
]