# Generated by Django 5.1 on 2024-09-02 17:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_stripeprofile_stripe_customer_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='stripeprofile',
            name='is_exempt',
            field=models.BooleanField(default=False),
        ),
    ]
