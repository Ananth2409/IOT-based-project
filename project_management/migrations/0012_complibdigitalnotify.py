

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('project_management', '0011_projectcomponents_component_library'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompLibDigitalNotify',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status_on_email', models.CharField(max_length=120)),
                ('status_on_sms', models.CharField(max_length=120)),
                ('status_off_email', models.CharField(max_length=120)),
                ('status_off_sms', models.CharField(max_length=120)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('Component_library', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comp_lib_digi_notify', to='project_management.ComponentsLibrary')),
            ],
            options={
                'db_table': 'component_library_digital_notifications',
            },
        ),
    ]
