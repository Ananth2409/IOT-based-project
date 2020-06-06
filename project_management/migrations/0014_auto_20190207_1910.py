# Generated by Django 2.1.2 on 2019-02-07 13:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project_management', '0013_projectdetails_deleted'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataprocess',
            name='deleted',
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name='projectcomponents',
            name='deleted',
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name='projectcomponentstags',
            name='deleted',
            field=models.DateTimeField(editable=False, null=True),
        ),
    ]