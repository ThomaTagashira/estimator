# Generated by Django 5.1.4 on 2025-01-04 01:39

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_subscription_trial_start_date'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subscription',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='subscription',
            name='last_name',
        ),
        migrations.RemoveField(
            model_name='subscription',
            name='phone_number',
        ),
        migrations.RemoveField(
            model_name='subscription',
            name='zipcode',
        ),
        migrations.CreateModel(
            name='UserInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_email', models.CharField(editable=False, max_length=150)),
                ('first_name', models.CharField(blank=True, max_length=50, null=True)),
                ('last_name', models.CharField(blank=True, max_length=50, null=True)),
                ('phone_number', models.CharField(blank=True, max_length=15, null=True)),
                ('zipcode', models.CharField(blank=True, max_length=10, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userInfo', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
