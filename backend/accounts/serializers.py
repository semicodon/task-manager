from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only shape for the current user. Used in /api/auth/me/ responses
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined"]
        read_only_fields = fields

class RegisterSerializer(serializers.ModelSerializer):
    """
    Write shape for user signup. Accepts username + email + password, validates them, and creates a User row with the password hashed.
    """

    # `write_only=True` - the field is accepted as input but excluded from outpyt
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Minimum 8 characters",
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "email": {
                "required": True, # built-in User has email as optional; we make it required
                "allow_blank": False,
            },
        }

    # Functions
    def validate_username(self, value: str) -> str:
        """
        Field-level validator; raise ValidationError to reject the input; return the (possibly cleaned) value to accept it.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )
        return value

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with that email already exists."
            )
        return value

    def create(self, validated_data: dict) -> User:
        """
        Called by `.save()` after validation passes create_user() - hashes the password before saving
        """
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
