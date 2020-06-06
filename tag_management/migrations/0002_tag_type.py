# Generated by Django 2.1.2 on 2018-12-27 07:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tag_management', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TagType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'tag_type',
            },
        ),
    ]