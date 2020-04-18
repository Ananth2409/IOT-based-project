# Generated by Django 2.1.2 on 2018-11-30 11:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project_management', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectdetails',
            name='mimic_data',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='projectdetails',
            name='project_name',
            field=models.CharField(max_length=200, unique=True),
        ),
    ]
