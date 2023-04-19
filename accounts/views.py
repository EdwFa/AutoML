from django.shortcuts import render, redirect
from django.views.generic import FormView
from django.views.generic.base import View
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

from pprint import pprint
import logging

from .serializers import UserSerializer, UserLoginSerilizer, TokenSeriazliser, UserUpdateSerializer, UserCreateSerializer


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
            new_user = UserCreateSerializer(data=request.data, many=False)
            if not new_user.is_valid():
                logger.debug(new_user.errors)
                logger.debug('Data for sign up not valid')
                return Response(data={'Status': 'Not valid'}, status=403)
            new_user.save()
            logger.debug(new_user)
            new_user = authenticate(**new_user.validated_data)
            logger.debug(new_user)
            if new_user:
                logger.debug(f'Welcome {new_user}')
                try:
                    token = Token.objects.get(user=new_user)
                    token.delete()
                except ObjectDoesNotExist:
                    pass
                token = Token.objects.create(user=new_user)
                return Response(TokenSeriazliser(token).data, status=201)
            return Response(data={'Status': 'Not valid'}, status=403)
