from rest_framework import serializers
from .models import Mascota

class MascotaSerializer(serializers.ModelSerializer):
    # Display the user's email, auto-filled from the request user in the views
    usuario = serializers.ReadOnlyField(source='usuario.email')

    class Meta:
        model = Mascota
        fields = ('id', 'usuario', 'nombre', 'especie', 'raza', 'edad')
