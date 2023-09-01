import os.path

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse

choices_employments = (
    ('S', 'Студент'),
    ('W', 'Работающий'),
)

class User(AbstractUser):
    city = models.CharField(max_length=255, null=True, blank=True)
    employment = models.CharField(max_length=1, choices=choices_employments, default='S')
    info = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'{self.username}'

    def get_absolute_url(self):
        return reverse('accounts:user-account', kwargs={'user_id': self.id})

    def save(self, *args, **kwargs):
        user_folder = os.path.join('datasets', self.username)
        if not os.path.exists(user_folder):
            os.mkdir(user_folder)

        super().save(*args, **kwargs)
