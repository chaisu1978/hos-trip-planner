# Generated by Django 5.1.7 on 2025-03-26 21:05

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0004_alter_tripleg_end_lat_alter_tripleg_end_lon_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='trip',
            name='departure_time',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
