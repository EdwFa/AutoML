# Generated by Django 4.2 on 2023-04-17 22:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='upload_date',
            field=models.DateTimeField(auto_now=True),
        ),
    ]