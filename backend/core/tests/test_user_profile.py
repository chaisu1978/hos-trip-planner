from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class UserProfileTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="profile@example.com",
            first_name="Profile",
            last_name="User",
            password="profilepass123"
        )
        self.access_token = str(AccessToken.for_user(self.user))
        self.auth_header = {"HTTP_AUTHORIZATION": f"Bearer {
            self.access_token
            }"}
        self.detail_url = reverse("user_detail")
        self.password_url = reverse("change_password")

    def test_get_profile_success(self):
        res = self.client.get(self.detail_url, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], self.user.email)

    def test_patch_profile_update_name(self):
        res = self.client.patch(
            self.detail_url,
            {"first_name": "Updated"},
            **self.auth_header
            )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")

    def test_change_password_success(self):
        res = self.client.post(self.password_url, {
            "current_password": "profilepass123",
            "new_password": "newprofilepass123",
            "confirm_password": "newprofilepass123"
        }, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newprofilepass123"))

    def test_change_password_wrong_current(self):
        res = self.client.post(self.password_url, {
            "current_password": "wrongpass",
            "new_password": "newpass",
            "confirm_password": "newpass"
        }, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_mismatch(self):
        res = self.client.post(self.password_url, {
            "current_password": "profilepass123",
            "new_password": "newpass123",
            "confirm_password": "differentpass"
        }, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
