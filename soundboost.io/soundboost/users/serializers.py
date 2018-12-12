from rest_framework import serializers
from rest_framework_jwt.utils import jwt_encode_handler, jwt_payload_handler

from users.models import User


class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    jwt_token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'email', 'password',
            'jwt_token',
        )

    def get_jwt_token(self, user):
        return jwt_encode_handler(jwt_payload_handler(user))

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')
        read_only_fields = fields
