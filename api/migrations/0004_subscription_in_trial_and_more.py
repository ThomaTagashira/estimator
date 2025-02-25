# Generated by Django 5.1.4 on 2025-01-02 00:57

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_subscription_first_name_subscription_last_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='in_trial',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='subscription',
            name='trial_end_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
