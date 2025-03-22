from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from core import models


class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""
    ordering = ['id']
    list_display = ['email', 'first_name', 'last_name', 'is_superuser']
    readonly_fields = ['last_login', 'created_at', 'updated_at']

    fieldsets = (
        (None, {'fields': ('email', 'password', 'first_name', 'last_name')}),
        (_('Personal info'), {
            'fields': (
                'phone_number',
                'address',
                'profile_picture',
                'timezone',
                'preferred_units',
            )
        }),
        (_('Notifications'), {
            'fields': (
                'email_notifications',
                'push_notifications',
            )
        }),
        (_('Permissions'), {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'first_name',
                'last_name',
                'password1',
                'password2',
                'phone_number',
                'address',
                'profile_picture',
                'timezone',
                'preferred_units',
                'email_notifications',
                'push_notifications',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
    )


admin.site.register(models.User, UserAdmin)
