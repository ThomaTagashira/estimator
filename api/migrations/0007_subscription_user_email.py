# Generated by Django 5.1 on 2024-11-22 00:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_subscription_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='user_email',
            field=models.CharField(default='temp_email', editable=False, max_length=150),
            preserve_default=False,
        ),
    ]
