# Generated by Django 5.1.4 on 2025-01-07 02:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_subscription_subscription_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='profile_completed',
            field=models.BooleanField(default=False),
        ),
    ]
