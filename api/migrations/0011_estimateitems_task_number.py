# Generated by Django 5.1 on 2024-10-15 00:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_clientdata_user_alter_estimateitems_user_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='estimateitems',
            name='task_number',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]