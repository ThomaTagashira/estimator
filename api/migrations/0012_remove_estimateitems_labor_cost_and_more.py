# Generated by Django 5.1 on 2024-10-16 23:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_estimateitems_task_number'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='estimateitems',
            name='labor_cost',
        ),
        migrations.RemoveField(
            model_name='estimateitems',
            name='material_cost',
        ),
        migrations.RemoveField(
            model_name='estimateitems',
            name='task_number',
        ),
    ]