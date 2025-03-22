from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'address',
            'profile_picture',
            'email_notifications',
            'push_notifications',
            'timezone',
            'preferred_units',
            'is_superuser',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['is_superuser', 'created_at', 'updated_at']

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class PublicTokenSerializer(serializers.Serializer):
    """Serializer for the PublicTokenView."""
    access = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user passwords."""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)


class RegisterUserSerializer(serializers.Serializer):
    """Serializer for registering a new user."""
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)


class ProfileImageUploadSerializer(serializers.Serializer):
    """Serializer for uploading a profile image"""
    profile_picture = serializers.ImageField()
