# Generated by Django 2.1.2 on 2018-12-27 07:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tag_management', '0002_tag_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tagdetails',
            name='address',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='batch',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='default',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='description',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='input',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='length',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='log',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='output',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='read_level',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='type',
        ),
        migrations.RemoveField(
            model_name='tagdetails',
            name='write_level',
        ),
    ]