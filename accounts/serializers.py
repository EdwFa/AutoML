from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        exclude = ['password']


class UserCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'city', 'employment')

    def create(self, validated_data):
        new_user = User.objects.create_user(**validated_data)
        return new_user


class UserUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'city', 'info', 'employment')

    def update(self, instance, validated_data):
        instance.info = validated_data.get('info', instance.info)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.city = validated_data.get('city', instance.city)
        instance.employment = validated_data.get('employment', instance.employment)
        instance.save()
        return instance


class TokenSeriazliser(serializers.ModelSerializer):

    class Meta:
        model = Token
        fields = ['key']


class UserLoginSerilizer(serializers.Serializer):
    model = User

    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)