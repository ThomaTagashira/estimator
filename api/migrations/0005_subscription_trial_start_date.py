# Generated by Django 5.1.4 on 2025-01-02 02:44

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_subscription_in_trial_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='trial_start_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
