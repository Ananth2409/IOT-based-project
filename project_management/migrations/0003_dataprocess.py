# Generated by Django 2.1.2 on 2018-11-30 12:16

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tag_management', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('project_management', '0002_auto_20181130_1700'),
    ]

    operations = [
        migrations.CreateModel(
            name='DataProcess',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('output', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_data', to='project_management.ProjectDetails')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tag_data', to='tag_management.TagDetails')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_data', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'data_process',
            },
        ),
    ]