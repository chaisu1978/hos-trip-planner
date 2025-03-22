import uuid
import os
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin
)


def profile_picture_file_path(instance, filename):
    """Generate file path for new profile picture."""
    ext = os.path.splitext(filename)[1]
    filename = f'{uuid.uuid4()}{ext}'


class UserManager(BaseUserManager):
    """Custom manager for User model."""

    def create_user(
            self,
            email,
            first_name,
            last_name,
            password=None,
            **extra_fields
            ):
        """Create and return a regular user."""
        if not email:
            raise ValueError('The Email field must be set')
        if not first_name or not last_name:
            raise ValueError('First name and Last name fields must be set')
        email = self.normalize_email(email).lower()
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
            )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
            self,
            email,
            first_name,
            last_name,
            password=None,
            **extra_fields
            ):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(
            email,
            first_name,
            last_name,
            password,
            **extra_fields
            )


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with additional fields."""
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to=profile_picture_file_path,
        null=True,
        blank=True
    )
    email_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    timezone = models.CharField(max_length=100, default='America/New_York')
    UNIT_CHOICES = [('mi', 'Miles'), ('km', 'Kilometers'),]
    preferred_units = models.CharField(
        max_length=2,
        choices=UNIT_CHOICES,
        default='mi',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

    @property
    def username(self):
        return self.email
