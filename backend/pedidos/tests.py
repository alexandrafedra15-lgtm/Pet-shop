from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from usuarios.models import Usuario
from catalogo.models import Categoria, Producto
from .models import Pedido, DetallePedido

class PedidoTests(APITestCase):
    def setUp(self):
        self.create_url = reverse('pedido-create')
        
        # Setup users
        self.user1 = Usuario.objects.create_user(email='buyer1@example.com', password='password123')
        self.user2 = Usuario.objects.create_user(email='buyer2@example.com', password='password123')
        
        # Setup catalogue
        self.category = Categoria.objects.create(nombre="Alimentos", descripcion="Comida")
        self.product1 = Producto.objects.create(
            categoria=self.category,
            nombre="Croquetas",
            descripcion="Ricas croquetas",
            precio=Decimal("50.00"),
            stock=10,
            especie_compatible="perro"
        )
        self.product2 = Producto.objects.create(
            categoria=self.category,
            nombre="Paté Gato",
            descripcion="Rico paté",
            precio=Decimal("10.00"),
            stock=20,
            especie_compatible="gato"
        )

    def test_create_pedido_success(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "detalles": [
                {"producto_id": self.product1.id, "cantidad": 2},
                {"producto_id": self.product2.id, "cantidad": 5}
            ]
        }
        response = self.client.post(self.create_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['estado'], 'pendiente')
        
        # Calculated total: (2 * 50.00) + (5 * 10.00) = 100.00 + 50.00 = 150.00
        self.assertEqual(Decimal(response.data['total']), Decimal("150.00"))
        
        # Check stock decrement in database
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 8)
        self.assertEqual(self.product2.stock, 15)
        
        # Verify details in database
        self.assertEqual(Pedido.objects.count(), 1)
        self.assertEqual(DetallePedido.objects.count(), 2)

    def test_create_pedido_exceeds_stock_fails_and_rolls_back(self):
        self.client.force_authenticate(user=self.user1)
        # product1 has 10 stock, product2 has 20 stock.
        # Let's request 11 of product1 (invalid) and 2 of product2 (valid on its own)
        data = {
            "detalles": [
                {"producto_id": self.product1.id, "cantidad": 11},
                {"producto_id": self.product2.id, "cantidad": 2}
            ]
        }
        response = self.client.post(self.create_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify database is intact (no orders created, stock not decremented due to atomic rollback)
        self.assertEqual(Pedido.objects.count(), 0)
        self.assertEqual(DetallePedido.objects.count(), 0)
        
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 10)
        self.assertEqual(self.product2.stock, 20)

    def test_pedido_user_isolation(self):
        # Create an order for user1
        self.client.force_authenticate(user=self.user1)
        data = {
            "detalles": [
                {"producto_id": self.product1.id, "cantidad": 1}
            ]
        }
        response = self.client.post(self.create_url, data, format='json')
        pedido_id = response.data['id']
        
        # User 1 should be able to read their own order detail
        detail_url = reverse('pedido-detail', kwargs={'id': pedido_id})
        response1 = self.client.get(detail_url, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # User 2 should NOT be able to read User 1's order detail
        self.client.force_authenticate(user=self.user2)
        response2 = self.client.get(detail_url, format='json')
        self.assertEqual(response2.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_pedido_unauthenticated(self):
        data = {
            "detalles": [
                {"producto_id": self.product1.id, "cantidad": 1}
            ]
        }
        response = self.client.post(self.create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Pedido.objects.count(), 0)

    def test_create_pedido_empty_items(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "detalles": []
        }
        response = self.client.post(self.create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
