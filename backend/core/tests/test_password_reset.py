from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="resetme@example.com",
            first_name="Reset",
            last_name="User",
            password="originalpass123"
        )
        self.reset_url = reverse("password_reset:reset-password-request")

    def test_password_reset_request_success(self):
        response = self.client.post(self.reset_url, {"email": self.user.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
