from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import Dataset, Networks, DefaultNetwork, ModelDefaultParam, ModelParam


User = get_user_model()

class UserShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password']

class DatasetSerializer(serializers.ModelSerializer):
    user = UserShowSerializer(many=False)

    class Meta:
        model = Dataset
        exclude = ['path']


class UploadSerializer(serializers.Serializer):
    file_uploaded = serializers.FileField()

    class Meta:
        fields = ['file_uploaded']


class DefaultParamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelDefaultParam
        fields = '__all__'


class DefaultNetworkSerializer(serializers.ModelSerializer):
    param = DefaultParamsSerializer(many=True)

    class Meta:
        model = DefaultNetwork
        fields = '__all__'


class ParamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelParam
        fields = '__all__'


class NetworkSerializer(serializers.ModelSerializer):
    param = ParamsSerializer(many=True)
    default_model = DefaultNetworkSerializer(many=False)

    class Meta:
        model = Networks
        exclude = ['path']


class SendDataSerializer(serializers.Serializer):
    dataset_path = serializers.CharField(max_length=250)
    dataset_name = serializers.CharField(max_length=250)
    target = serializers.CharField(max_length=250)