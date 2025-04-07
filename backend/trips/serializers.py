from rest_framework import serializers
from .models import Trip, TripLeg, TripSegmentStep
from drf_spectacular.utils import extend_schema_field


class TripSegmentStepSerializer(serializers.ModelSerializer):
    """ Serializer for Trip Segment Steps"""
    class Meta:
        model = TripSegmentStep
        fields = "__all__"
        read_only_fields = ["leg"]


class TripLegSerializer(serializers.ModelSerializer):
    steps = TripSegmentStepSerializer(many=True, read_only=True)
    leg_type = serializers.SerializerMethodField()
    polyline_geometry = serializers.JSONField(read_only=True)
    start_label = serializers.CharField(read_only=True)
    end_label = serializers.CharField(read_only=True)

    class Meta:
        model = TripLeg
        fields = "__all__"
        read_only_fields = ["trip"]

    @extend_schema_field(serializers.CharField())
    def get_leg_type(self, obj) -> str:
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


class DutyPeriodSerializer(serializers.Serializer):
    status = serializers.CharField()
    start = serializers.CharField()
    end = serializers.CharField()


class DailyLogSheetSerializer(serializers.Serializer):
    date = serializers.DateField()
    month = serializers.CharField()
    day = serializers.CharField()
    year = serializers.CharField()
    from_location = serializers.CharField()
    to_location = serializers.CharField()
    total_miles = serializers.FloatField()
    total_hours = serializers.FloatField()
    duty_periods = DutyPeriodSerializer(many=True)


class GeocodeResultSerializer(serializers.Serializer):
    place_id = serializers.CharField()
    display_name = serializers.CharField()
    lat = serializers.CharField()
    lon = serializers.CharField()


class GeocodeReverseResultSerializer(serializers.Serializer):
    display_name = serializers.CharField()
    lat = serializers.CharField()
    lon = serializers.CharField()


class GenericDetailMessageSerializer(serializers.Serializer):
    detail = serializers.CharField(
        help_text="Operation completed"
    )


class SvgLogListSerializer(serializers.Serializer):
    count = serializers.IntegerField(
        help_text="Total number of SVG log files available."
    )
    svg_urls = serializers.ListField(
        child=serializers.URLField(),
        help_text="List of URLs pointing to the generated daily log SVG files."
    )
