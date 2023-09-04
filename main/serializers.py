from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import Dataset, LearnModel


User = get_user_model()

class UserShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password']

class DatasetSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='get_user')
    statistic = serializers.BooleanField(source='exist_stat')

    class Meta:
        model = Dataset
        exclude = ['path']


class UploadSerializer(serializers.Serializer):
    file_uploaded = serializers.FileField()

    class Meta:
        fields = ['file_uploaded']


class SendDataSerializer(serializers.Serializer):
    dataset_path = serializers.CharField(max_length=250)
    dataset_name = serializers.CharField(max_length=250)
    target = serializers.CharField(max_length=250)