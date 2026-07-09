import requests
from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Mascota
from .serializers import MascotaSerializer

class MascotaListCreateView(generics.ListCreateAPIView):
    serializer_class = MascotaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return pets that belong to the authenticated user
        return Mascota.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user to the new mascota record
        serializer.save(usuario=self.request.user)


class RazasView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, especie):
        # Canonicalize and validate specie
        especie_clean = especie.lower().strip()
        if especie_clean not in ['perro', 'gato']:
            return Response(
                {"error": "Especie no válida. Debe ser 'perro' o 'gato'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if especie_clean == 'perro':
            url = "https://api.thedogapi.com/v1/breeds"
            api_key = getattr(settings, 'DOG_API_KEY', '')
        else:
            url = "https://api.thecatapi.com/v1/breeds"
            api_key = getattr(settings, 'CAT_API_KEY', '')

        headers = {}
        if api_key:
            headers['x-api-key'] = api_key

        try:
            # Make API request to external service
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Return simplified list of breeds
                razas = [{"id": breed.get("id"), "nombre": breed.get("name")} for breed in data]
                return Response(razas, status=status.HTTP_200_OK)
            return Response(
                {"error": "Error al consultar la API externa de razas."},
                status=response.status_code
            )
        except requests.RequestException as e:
            return Response(
                {"error": f"Error de conexión con la API externa: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
