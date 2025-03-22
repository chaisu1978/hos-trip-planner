from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        # If the token is public, skip user retrieval
        if validated_token.get("is_public", False):
            return None  # No user associated with public tokens

        # For authenticated tokens, proceed with default behavior
        return super().get_user(validated_token)


class CustomJWTAuthenticationExtension(OpenApiAuthenticationExtension):
    target_class = 'core.authentication.CustomJWTAuthentication'
    name = 'BearerAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
        }
