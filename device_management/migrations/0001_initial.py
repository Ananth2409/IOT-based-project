# Generated by Django 2.1.2 on 2018-11-21 14:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DeviceDetails',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device_type', models.IntegerField()),
                ('device_name', models.CharField(max_length=120)),
                ('device_image', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Tags',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag_name', models.CharField(max_length=120)),
                ('ip_address', models.BigIntegerField()),
                ('polling_interval', models.BigIntegerField()),
                ('device', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='device_management.DeviceDetails')),
            ],
        ),
    ]
