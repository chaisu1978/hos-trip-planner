from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    PublicTokenView,
    UserDetailView,
    RegisterUserView,
    ChangePasswordView,
    ProfileImageUploadView,
)


urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('public-token/', PublicTokenView.as_view(), name='public_token'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path("me/password/", ChangePasswordView.as_view(), name="change_password"),
    path("register/", RegisterUserView.as_view(), name="register"),
    path('profile-image-upload/', ProfileImageUploadView.as_view(), name='profile-image-upload'),
    path("password_reset/", include("django_rest_passwordreset.urls", namespace="password_reset")),

]

