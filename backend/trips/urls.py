from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet
from .views import GeocodeSearchView, GeocodeReverseView
router = DefaultRouter()
router.register(r"trips", TripViewSet, basename="trip")

urlpatterns = [
    path("", include(router.urls)),
    path("geocode/search/", GeocodeSearchView.as_view(), name="geocode-search"),
    path("geocode/reverse/", GeocodeReverseView.as_view(), name="geocode-reverse"),
]
