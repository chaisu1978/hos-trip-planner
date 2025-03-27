from django.core.management.base import BaseCommand
from trips.services.generate_daily_logs import generate_daily_logs
from trips.models import Trip
from trips.services.svg_log_sheet import inject_duty_periods_into_svg
from django.shortcuts import get_object_or_404

class Command(BaseCommand):
    help = "Generate an SVG log sheet for a specific trip"

    def add_arguments(self, parser):
        parser.add_argument("trip_id", type=int)

    def handle(self, *args, **options):
        trip_id = options["trip_id"]
        trip = get_object_or_404(Trip, id=trip_id)
        logs = generate_daily_logs(trip)
        inject_duty_periods_into_svg(logs)
