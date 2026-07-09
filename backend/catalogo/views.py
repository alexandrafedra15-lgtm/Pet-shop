from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Producto
from .serializers import ProductoSerializer

class ProductoListView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Producto.objects.all().order_by('id')
        especie = self.request.query_params.get('especie', None)
        
        if especie:
            especie_clean = especie.lower().strip()
            if especie_clean in ['perro', 'gato']:
                # Return products matching the specific species or "ambos"
                queryset = queryset.filter(
                    Q(especie_compatible=especie_clean) | Q(especie_compatible='ambos')
                )
            else:
                # If species parameter is invalid, return empty list
                queryset = queryset.none()
                
        return queryset
