from decimal import Decimal
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Categoria, Producto

class CatalogoTests(APITestCase):
    def setUp(self):
        self.list_url = reverse('producto-list')
        
        # Create categories
        self.cat_food = Categoria.objects.create(nombre="Alimentos", descripcion="Comida")
        self.cat_toys = Categoria.objects.create(nombre="Juguetes", descripcion="Para jugar")
        
        # Create products
        self.prod_dog = Producto.objects.create(
            categoria=self.cat_food,
            nombre="Croquetas Perro",
            descripcion="Ricas croquetas",
            precio=Decimal("45.90"),
            stock=10,
            especie_compatible="perro"
        )
        self.prod_cat = Producto.objects.create(
            categoria=self.cat_food,
            nombre="Comida Gato",
            descripcion="Rico paté",
            precio=Decimal("8.50"),
            stock=15,
            especie_compatible="gato"
        )
        self.prod_both = Producto.objects.create(
            categoria=self.cat_toys,
            nombre="Pelota Mascota",
            descripcion="Pelota divertida",
            precio=Decimal("12.00"),
            stock=5,
            especie_compatible="ambos"
        )

    def test_list_all_products(self):
        response = self.client.get(self.list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return all 3 products
        self.assertEqual(len(response.data), 3)

    def test_filter_products_perro(self):
        response = self.client.get(self.list_url, {'especie': 'perro'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return Croquetas Perro and Pelota Mascota (compatible with both)
        self.assertEqual(len(response.data), 2)
        names = [item['nombre'] for item in response.data]
        self.assertIn("Croquetas Perro", names)
        self.assertIn("Pelota Mascota", names)
        self.assertNotIn("Comida Gato", names)

    def test_filter_products_gato(self):
        response = self.client.get(self.list_url, {'especie': 'gato'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return Comida Gato and Pelota Mascota (compatible with both)
        self.assertEqual(len(response.data), 2)
        names = [item['nombre'] for item in response.data]
        self.assertIn("Comida Gato", names)
        self.assertIn("Pelota Mascota", names)
        self.assertNotIn("Croquetas Perro", names)

    def test_filter_products_invalid_species(self):
        response = self.client.get(self.list_url, {'especie': 'pajaro'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return empty list
        self.assertEqual(len(response.data), 0)

    def test_price_validation_negative(self):
        prod = Producto(
            categoria=self.cat_food,
            nombre="Test",
            descripcion="Test",
            precio=Decimal("-5.00"),
            stock=10,
            especie_compatible="perro"
        )
        with self.assertRaises(ValidationError):
            prod.full_clean()

    def test_price_validation_zero(self):
        prod = Producto(
            categoria=self.cat_food,
            nombre="Test",
            descripcion="Test",
            precio=Decimal("0.00"),
            stock=10,
            especie_compatible="perro"
        )
        with self.assertRaises(ValidationError):
            prod.full_clean()
