# trips/urls.py

from django.urls import path
from .views import TripViewSet

trip_list = TripViewSet.as_view({
    "get": "list",
    "post": "create"
})

trip_detail = TripViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy"
})

urlpatterns = [
    path("trips/", trip_list, name="trip-list"),
    path("trips/<int:pk>/", trip_detail, name="trip-detail"),
]
