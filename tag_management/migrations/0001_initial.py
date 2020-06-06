# Generated by Django 2.1.2 on 2018-11-22 13:11

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TagDetails',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('tag_id', models.IntegerField()),
                ('description', models.CharField(max_length=200)),
                ('address', models.BigIntegerField()),
                ('batch', models.CharField(max_length=120)),
                ('type', models.CharField(max_length=120)),
                ('length', models.IntegerField()),
                ('default', models.CharField(max_length=120)),
                ('input', models.CharField(max_length=120)),
                ('output', models.CharField(max_length=120)),
                ('read_level', models.BigIntegerField()),
                ('write_level', models.BigIntegerField()),
                ('log', models.CharField(max_length=120)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'tag_details',
            },
        ),
    ]