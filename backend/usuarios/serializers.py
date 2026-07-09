from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario

class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    email = serializers.EmailField()

    class Meta:
        model = Usuario
        fields = ('email', 'password', 'telefono')

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # The default username field is mapped to the email since USERNAME_FIELD = 'email'
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom fields to the response
        data['id'] = self.user.id
        data['email'] = self.user.email
        data['telefono'] = self.user.telefono
        return data
