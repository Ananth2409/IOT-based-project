# Generated by Django 2.1.2 on 2018-12-13 07:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project_management', '0004_auto_20181211_1905'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectdetails',
            name='project_name',
            field=models.CharField(max_length=200, null=True, unique=True),
        ),
    ]
