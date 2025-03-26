from rest_framework import serializers
from .models import Trip, TripLeg, TripSegmentStep

class TripSegmentStepSerializer(serializers.ModelSerializer):
    """ Serializer for Trip Segment Steps"""
    class Meta:
        model = TripSegmentStep
        fields = "__all__"
        read_only_fields = ["leg"]


class TripLegSerializer(serializers.ModelSerializer):
    """ Serializer for Trip Legs"""
    steps = TripSegmentStepSerializer(many=True, read_only=True)

    class Meta:
        model = TripLeg
        fields = "__all__"
        read_only_fields = ["trip"]


class TripSerializer(serializers.ModelSerializer):
    """ Serializer for Trips"""
    legs = TripLegSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ["user", "planned_distance_miles", "planned_duration_hours", "planned_at"]
