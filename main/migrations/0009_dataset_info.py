# Generated by Django 4.2 on 2023-09-15 10:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_learnmodel_remove_modeldefaultparam_model_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='info',
            field=models.TextField(null=True),
        ),
    ]
