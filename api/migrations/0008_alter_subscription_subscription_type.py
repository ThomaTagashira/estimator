# Generated by Django 5.1.4 on 2025-01-06 20:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_subscription_first_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subscription',
            name='subscription_type',
            field=models.CharField(choices=[('Trial', 'Trial'), ('Basic', 'Basic'), ('Premium', 'Premium'), ('Enterprise', 'Enterprise')], default='Trial', max_length=50),
        ),
    ]
