from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

from pprint import pprint
import logging
import re

from .serializers import UserSerializer, UserLoginSerilizer, TokenSeriazliser, UserUpdateSerializer, UserCreateSerializer
from ML_Datamed.settings import EMAIL_URL, EMAIL_PASSWORD, EMAIL_AUTH

User = get_user_model()
logger = logging.getLogger(__name__)


class AccountApiView(APIView):
    def get(self, request):
        logger.debug(f'user {request.user.username} get notifications...')
        query_user = User.objects.get(username=request.user.username)
        serializer_for_query_users = UserSerializer(
            instance=query_user,
            many=False,
        )
        data = {'data': serializer_for_query_users.data}
        return Response(data)


class LoginSessionApiView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request):
        """Настроить защиту позже"""
        logger.info('Someone try to login...')
        serializer = UserLoginSerilizer(data=request.data)
        logger.debug(serializer)
        if serializer.is_valid():
            logger.debug(serializer.validated_data)
            authenticated_user = authenticate(**serializer.validated_data)
            if authenticated_user:
                logger.debug(f'Welcome {authenticated_user}')
                login(request, authenticated_user)
            return Response(serializer.errors, status=403)
        else:
            return Response(serializer.errors, status=400)


class LoginApiView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request):
        """Настроить защиту позже"""
        logger.info('Someone try to login...')
        serializer = UserLoginSerilizer(data=request.data)
        logger.debug(serializer)
        if serializer.is_valid():
            logger.debug(serializer.validated_data)
            authenticated_user = authenticate(**serializer.validated_data)
            if authenticated_user:
                logger.debug(f'Welcome {authenticated_user}')
                try:
                    token = Token.objects.get(user=authenticated_user)
                    token.delete()
                except ObjectDoesNotExist:
                    pass
                token = Token.objects.create(user=authenticated_user)
                return Response(TokenSeriazliser(token).data)
            return Response(serializer.errors, status=403)
        else:
            return Response(serializer.errors, status=400)


class LogOutApiView(APIView):
    def get(self, request: Request):
        if request.user.is_authenticated and request.user.is_active:
            logger.info(f'Logout {request.user.username}...')
            logout(request)
            return Response(data={'Status': 'Success'}, status=200)
        else:
            return Response(data={'Status': 'Unknowed user'}, status=403)


class RegistrationApiView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        if not request.user.is_authenticated:
            logger.info(f'Sign Up new user {request.data}')
            username = request.data.get('username', None)
            if username is None:
                return Response(data={'Status': 'Not valid', 'error': "Имя пользователя не указано"}, status=403)
            try:
                User.objects.get(username=username)
            except ObjectDoesNotExist:
                logger.debug('Valid username')
            else:
                return Response(data={'Status': 'Not valid', 'error': "Данное имя занято, выберите другое"}, status=403)

            email = request.data.get('email', None)
            if email is None and not re.fullmatch(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+', email):
                return Response(data={'Status': 'Not valid', 'error': "Данный email введен некорректно"}, status=403)

            new_user = UserCreateSerializer(data=request.data, many=False)
            if not new_user.is_valid():
                logger.debug(new_user.errors)
                logger.debug('Data for sign up not valid')
                return Response(data={'Status': 'Not valid', 'error': ""}, status=403)
            password = new_user.save()
            send_mail(
                'Message from ml.datamed.pro',
                f'Your password for system : {password}',
                from_email=EMAIL_URL,
                recipient_list=[new_user.validated_data.get('email')],
                fail_silently=False,
                auth_user=EMAIL_AUTH,
                auth_password=EMAIL_PASSWORD
            )
            return Response(data={'Status': 'Success', 'error': None}, status=201)