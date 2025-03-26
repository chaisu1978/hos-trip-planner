# Generated by Django 5.1.7 on 2025-03-26 13:51

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=100)),
                ('current_location_label', models.CharField(max_length=255)),
                ('current_location_lat', models.FloatField()),
                ('current_location_lon', models.FloatField()),
                ('pickup_location_label', models.CharField(max_length=255)),
                ('pickup_location_lat', models.FloatField()),
                ('pickup_location_lon', models.FloatField()),
                ('dropoff_location_label', models.CharField(max_length=255)),
                ('dropoff_location_lat', models.FloatField()),
                ('dropoff_location_lon', models.FloatField()),
                ('current_cycle_hours', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
                ('planned_distance_miles', models.DecimalField(blank=True, decimal_places=2, max_digits=7, null=True)),
                ('planned_duration_hours', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('planned_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trips', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TripLeg',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('leg_order', models.PositiveIntegerField()),
                ('start_label', models.CharField(max_length=255)),
                ('start_lat', models.FloatField()),
                ('start_lon', models.FloatField()),
                ('end_label', models.CharField(max_length=255)),
                ('end_lat', models.FloatField()),
                ('end_lon', models.FloatField()),
                ('distance_miles', models.DecimalField(decimal_places=2, max_digits=7)),
                ('duration_hours', models.DecimalField(decimal_places=2, max_digits=5)),
                ('departure_time', models.DateTimeField(blank=True, null=True)),
                ('arrival_time', models.DateTimeField(blank=True, null=True)),
                ('is_rest_stop', models.BooleanField(default=False)),
                ('is_fuel_stop', models.BooleanField(default=False)),
                ('notes', models.TextField(blank=True)),
                ('trip', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='legs', to='trips.trip')),
            ],
        ),
        migrations.CreateModel(
            name='TripSegmentStep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('step_order', models.PositiveIntegerField()),
                ('instruction', models.TextField(blank=True, default='')),
                ('distance_meters', models.DecimalField(decimal_places=2, max_digits=7)),
                ('duration_seconds', models.DecimalField(decimal_places=2, max_digits=6)),
                ('start_lat', models.FloatField()),
                ('start_lon', models.FloatField()),
                ('end_lat', models.FloatField()),
                ('end_lon', models.FloatField()),
                ('waypoints', models.JSONField(blank=True, default=list, null=True)),
                ('leg', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='steps', to='trips.tripleg')),
            ],
        ),
    ]
