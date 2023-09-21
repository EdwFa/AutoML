from django.db import models
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.urls import reverse

import os

User = get_user_model()


choices_types_data = (
    ('I', 'Натуральное число'),
    ('F', 'Вещественное число'),
    ('S', 'Строка'),
    ('B', 'Булево значение')
)

class Dataset(models.Model):
    """Таблица для храниния общей информации о датасете, так же хранит пользоватлея который загрузил ее и путь до файла"""
    name = models.CharField(max_length=64)
    path = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='base_datasets', related_query_name='base_datasets')
    upload_date = models.DateTimeField(auto_now=True)
    format = models.CharField(max_length=8)
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

    def get_stat_path(self):
        return os.path.join(self.path, 'statistic.html')


class LearnModel(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.PROTECT, related_name='models')
    name = models.CharField(max_length=64)

    def __str__(self):
        return f'{self.dataset.name}({self.dataset.user.username}) - {self.name}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        os.remove(os.path.join(self.dataset.path, 'models', self.name))
        super().delete(*args, **kwargs)


