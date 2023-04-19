from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse

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
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='datasets', related_query_name='datasets')
    upload_date = models.DateTimeField(auto_now=True)
    format = models.CharField(max_length=8)
    size = models.IntegerField()

    def __str__(self):
        return f'{self.user.username} - {self.name}'

    def get_absolute_url(self):
        return reverse('main:dataset', kwargs={'dateset_id': self.id})

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class DefaultNetwork(models.Model):
    """Таблица для храниния начальных настроек моделей для обучения"""
    name = models.CharField(max_length=64)

    def __str__(self):
        return f'{self.name}'

    def get_absolute_url(self):
        return reverse('main:default-model', kwargs={'model_id': self.id})


class Networks(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.PROTECT, related_name='model')
    default_model = models.ForeignKey(DefaultNetwork, on_delete=models.PROTECT, related_name='prepared_model')
    path = models.CharField(max_length=255)
    size = models.IntegerField()

    def __str__(self):
        return f'{self.dataset.name} - {self.default_model.name}'

    def get_absolute_url(self):
        return reverse('main:model', kwargs={'model_id': self.id})

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class ModelParam(models.Model):
    """Таблица для храниения параметров модели"""
    model = models.ForeignKey(Networks, on_delete=models.CASCADE, related_name='param')
    label = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    type_data = models.CharField(max_length=1, choices=choices_types_data, default='I')

    def __str__(self):
        return f'{self.model.id} {self.label}'


class ModelDefaultParam(models.Model):
    """Таблица для храниения параметров модели"""
    model = models.ForeignKey(DefaultNetwork, on_delete=models.CASCADE, related_name='param')
    label = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    type_data = models.CharField(max_length=1, choices=choices_types_data, default='I')
    choices_values = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return f'{self.model.name} {self.label}'
