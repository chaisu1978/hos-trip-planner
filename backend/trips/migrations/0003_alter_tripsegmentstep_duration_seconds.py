# Generated by Django 5.1.7 on 2025-03-26 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0002_alter_trip_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tripsegmentstep',
            name='duration_seconds',
            field=models.DecimalField(decimal_places=2, max_digits=7),
        ),
    ]
