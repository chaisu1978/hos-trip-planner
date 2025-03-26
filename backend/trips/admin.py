from django.contrib import admin
from .models import Trip, TripLeg, TripSegmentStep

admin.site.register(Trip)
admin.site.register(TripLeg)
admin.site.register(TripSegmentStep)
