from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            password="testpass123"
        )

    def test_login_success(self):
        url = reverse("token_obtain_pair")
        res = self.client.post(url, {
            "email": "test@example.com",
            "password": "testpass123"
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)

    def test_register_user(self):
        url = reverse("register")
        data = {
            "email": "new@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "newpass123",
            "confirm_password": "newpass123",
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, 201)

    def test_login_failure_wrong_password(self):
        url = reverse("token_obtain_pair")
        res = self.client.post(url, {
            "email": "test@example.com",
            "password": "wrongpass"
        })
        self.assertEqual(res.status_code, 401)

    def test_refresh_token_success(self):
        refresh = RefreshToken.for_user(self.user)
        url = reverse("token_refresh")
        res = self.client.post(url, {"refresh": str(refresh)})
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)

    def test_public_token(self):
        url = reverse("public_token")
        res = self.client.post(url)
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)

    def test_register_mismatched_passwords(self):
        url = reverse("register")
        data = {
            "email": "fail@example.com",
            "first_name": "Fail",
            "last_name": "User",
            "password": "pass123",
            "confirm_password": "wrongpass",
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, 400)
