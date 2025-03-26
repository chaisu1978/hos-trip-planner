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
    leg_type = serializers.SerializerMethodField()

    class Meta:
        model = TripLeg
        fields = "__all__"
        read_only_fields = ["trip"]

    def get_leg_type(self, obj):
        if obj.is_rest_stop:
            return "rest"
        if obj.is_fuel_stop:
            return "fuel"
        if "30-minute" in obj.notes.lower():
            return "break"
        if "pickup" in obj.notes.lower():
            return "pickup"
        if "dropoff" in obj.notes.lower():
            return "dropoff"
        if obj.distance_miles > 0:
            return "drive"
        return "other"

class TripSerializer(serializers.ModelSerializer):
    """ Serializer for Trips"""
    legs = TripLegSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ["user", "planned_distance_miles", "planned_duration_hours", "planned_at"]
