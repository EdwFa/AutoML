from django.db import models
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.urls import reverse

import os
import json

User = get_user_model()


choices_types_data = (
    ('I', 'Натуральное число'),
    ('F', 'Вещественное число'),
    ('S', 'Строка'),
    ('B', 'Булево значение')
)

choices_types_datasets = (
    (1, 'Классификация'),
    (2, 'Регрессия')
)

class Dataset(models.Model):
    """Таблица для храниния общей информации о датасете, так же хранит пользоватлея который загрузил ее и путь до файла"""
    name = models.CharField(max_length=64)
    path = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets', related_query_name='datasets')
    upload_date = models.DateTimeField(auto_now=True)
    format = models.CharField(max_length=8)
    type = models.IntegerField(choices=choices_types_datasets, default=1)
    size = models.IntegerField()
    info = models.TextField(null=True)

    def __str__(self):
        return f'{self.user.username} - {self.name}'

    def get_absolute_url(self):
        return reverse('main:dataset', kwargs={'dateset_id': self.id})

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.path != '/' and  os.path.exists(self.path):
            for comp in os.listdir(self.path):
                print(comp)
                if os.path.isfile(os.path.join(self.path, comp)):
                    os.remove(os.path.join(self.path, comp))
            os.rmdir(self.path)
        super().delete(*args, **kwargs)

    def get_user(self):
        return self.user.username

    def exist_stat(self):
        return 'statistic.html' in os.listdir(self.path)

    def get_dataset_path(self):
        return os.path.join(self.path, f'{self.id}_{self.name}.csv')

    def get_type(self):
        return choices_types_datasets[self.type - 1][1]

    def get_type_code(self):
        return choices_types_datasets[self.type - 1][0]

    def get_stat_path(self):
        return os.path.join(self.path, 'statistic.html')

    def get_graphics_path(self):
        return os.path.join(self.path, 'graphics.jpeg')

class LearnModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='models', related_query_name='models', null=True)
    name = models.CharField(max_length=64)
    configs = models.JSONField(null=True)
    info = models.TextField(null=True)
    type = models.IntegerField(choices=choices_types_datasets, default=1)
    date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'({self.user.username}) - {self.id}{self.name}'

    def save(self, *args, **kwargs):
        user_folder = os.path.join('models', self.user.username)
        if not os.path.exists(user_folder):
            os.mkdir(user_folder)
        super().save(*args, **kwargs)

    def get_model_file(self):
        model_dir = os.path.join('models', self.user.username, f'{self.id}.sav')
        if not os.path.exists(model_dir):
            raise Exception("Model file doesnt exist")
        return model_dir

    def get_configs(self):
        return json.load(self.configs)

    def get_user(self):
        return self.user.username

    def delete(self, *args, **kwargs):
        try:
            os.remove(self.get_model_file())
        except:
            pass
        finally:
            super().delete(*args, **kwargs)


