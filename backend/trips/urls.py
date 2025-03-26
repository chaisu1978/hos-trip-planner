from rest_framework.routers import DefaultRouter
from .views import TripViewSet

router = DefaultRouter()
router.register(r"trips", TripViewSet, basename="trips")

urlpatterns = router.urls
