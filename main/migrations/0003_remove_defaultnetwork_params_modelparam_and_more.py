# Generated by Django 4.2 on 2023-04-18 20:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_dataset_upload_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='defaultnetwork',
            name='params',
        ),
        migrations.CreateModel(
            name='ModelParam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=255)),
                ('value', models.CharField(max_length=255)),
                ('type_data', models.CharField(choices=[('I', 'Натуральное число'), ('F', 'Вещественное число'), ('S', 'Строка'), ('B', 'Булево значение')], default='I', max_length=1)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='param', to='main.networks')),
            ],
        ),
        migrations.CreateModel(
            name='ModelDefaultParam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=255)),
                ('value', models.CharField(max_length=255)),
                ('type_data', models.CharField(choices=[('I', 'Натуральное число'), ('F', 'Вещественное число'), ('S', 'Строка'), ('B', 'Булево значение')], default='I', max_length=1)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='param', to='main.defaultnetwork')),
            ],
        ),
    ]
