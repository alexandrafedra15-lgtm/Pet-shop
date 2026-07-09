from rest_framework import serializers
from .models import Categoria, Producto

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'descripcion')


class ProductoSerializer(serializers.ModelSerializer):
    # Field to retrieve full details of the category if needed by frontend
    categoria_detalle = CategoriaSerializer(source='categoria', read_only=True)

    class Meta:
        model = Producto
        fields = (
            'id',
            'categoria',
            'categoria_detalle',
            'nombre',
            'descripcion',
            'precio',
            'stock',
            'especie_compatible',
            'imagen'
        )
