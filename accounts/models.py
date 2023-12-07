import os.path
import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse

import pandas as pd


choices_employments = (
    ('S', 'Студент'),
    ('W', 'Работающий'),
)

def clear_dir(dir_path):
    for comp in os.listdir(dir_path):
        print(comp)
        comp_path = os.path.join(dir_path, comp)
        if os.path.isdir(comp_path):
            clear_dir(comp_path)
        if os.path.isfile(comp_path):
            os.remove(comp_path)
    os.rmdir(dir_path)
    return

class User(AbstractUser):
    city = models.CharField(max_length=255, null=True, blank=True)
    employment = models.CharField(max_length=1, choices=choices_employments, default='S')
    info = models.TextField(null=True, blank=True)
    allow_date = models.DateField(null=True, blank=True)
    count = models.IntegerField(default=10000)

    def __str__(self):
        return f'{self.username}'

    def get_absolute_url(self):
        return reverse('accounts:user-account', kwargs={'user_id': self.id})

    def save(self, *args, **kwargs):
        user_folder = os.path.join('datasets', self.username)
        super().save(*args, **kwargs)

        if not os.path.exists(user_folder):
            os.mkdir(user_folder)
            for basic_dataset in os.listdir(os.path.join('documents', 'base_datasets')):
                dataset = pd.read_excel(os.path.join('documents', 'base_datasets', basic_dataset))
                dataset_table = self.datasets.create(
                    name='.'.join(basic_dataset.split('.')[:-1]),
                    user=self,
                    size=10000,
                    format=basic_dataset.split('.')[-1],
                    info=basic_dataset,
                    path=""
                )
                path_to_save_folder = os.path.join('datasets', self.username,
                                                   f'{dataset_table.id}_{dataset_table.name}')
                os.mkdir(path_to_save_folder)
                dataset_table.path = path_to_save_folder
                dataset_table.save()
                dataset.to_csv(os.path.join(path_to_save_folder, f'{dataset_table.id}_{dataset_table.name}.csv'), index=False)


    def delete(self, *args, **kwargs):
        # for dataset in self.datasets.all():
        #     dataset.delete()
        # if os.path.exists(os.path.join('datasets', self.username)):
        #     clear_dir(os.path.join('datasets', self.username))
        super().delete(*args, **kwargs)
