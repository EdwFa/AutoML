# Generated by Django 4.2 on 2023-04-25 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_modeldefaultparam_choices_values'),
    ]

    operations = [
        migrations.AlterField(
            model_name='modeldefaultparam',
            name='value',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='modelparam',
            name='value',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
