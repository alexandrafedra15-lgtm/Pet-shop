from decimal import Decimal
from django.urls import reverse
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from usuarios.models import Usuario
from catalogo.models import Categoria, Producto
from pedidos.models import Pedido, DetallePedido
from .models import Pago

class PagoTests(APITestCase):
    def setUp(self):
        self.user1 = Usuario.objects.create_user(email='payer1@example.com', password='password123')
        self.user2 = Usuario.objects.create_user(email='payer2@example.com', password='password123')
        
        # Setup catalog
        self.category = Categoria.objects.create(nombre="Alimentos")
        self.product = Producto.objects.create(
            categoria=self.category,
            nombre="Alimento Perro",
            descripcion="Nutritivo",
            precio=Decimal("20.00"),
            stock=15,
            especie_compatible="perro"
        )
        
        # Setup order for user1 (stock decrements by 5, remaining stock is 10)
        self.client.force_authenticate(user=self.user1)
        self.pedido = Pedido.objects.create(usuario=self.user1, total=Decimal("100.00"), estado='pendiente')
        self.detalle = DetallePedido.objects.create(
            pedido=self.pedido,
            producto=self.product,
            cantidad=5,
            subtotal=Decimal("100.00")
        )
        self.product.stock = 10
        self.product.save()

        # Override settings for tests
        from django.conf import settings
        settings.PAYPAL_CLIENT_ID = 'test_client_id'
        settings.PAYPAL_SECRET = 'test_secret'
        settings.PAYPAL_MODE = 'sandbox'

        self.crear_url = reverse('pago-crear-orden', kwargs={'pedido_id': self.pedido.id})

    @patch('requests.post')
    def test_crear_orden_paypal_success(self, mock_post):
        # Mock oauth token request & order creation request
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                pass

        # Setup side effect to return token and then the order
        mock_post.side_effect = [
            MockResponse({"access_token": "mock-token-abc"}, 200),
            MockResponse({"id": "PAYPAL-ORD-123", "status": "CREATED", "links": []}, 201)
        ]

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.crear_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['paypal_order_id'], "PAYPAL-ORD-123")
        self.assertEqual(response.data['status'], 'creado')
        
        # Verify Pago created in DB
        self.assertEqual(Pago.objects.count(), 1)
        pago = Pago.objects.first()
        self.assertEqual(pago.pedido, self.pedido)
        self.assertEqual(pago.estado, 'creado')
        self.assertEqual(pago.monto, Decimal("100.00"))

    @patch('requests.post')
    def test_capturar_orden_paypal_success(self, mock_post):
        pago = Pago.objects.create(pedido=self.pedido, paypal_order_id="MOCK-ORD-SUCCESS", estado='creado', monto=Decimal("100.00"))
        
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                pass

        # Side effects: oauth token -> capture payment
        mock_post.side_effect = [
            MockResponse({"access_token": "mock-token-abc"}, 200),
            MockResponse({"id": "MOCK-ORD-SUCCESS", "status": "COMPLETED"}, 200)
        ]

        self.client.force_authenticate(user=self.user1)
        url = reverse('pago-capturar', kwargs={'order_id': pago.paypal_order_id})
        response = self.client.post(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify status updates in DB
        pago.refresh_from_db()
        self.pedido.refresh_from_db()
        self.assertEqual(pago.estado, 'capturado')
        self.assertEqual(self.pedido.estado, 'pagado')
        
        # Stock remains at 10 (decremented when order was created)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    @patch('requests.post')
    def test_capturar_orden_paypal_failed_rolls_back_stock(self, mock_post):
        pago = Pago.objects.create(pedido=self.pedido, paypal_order_id="MOCK-ORD-FAIL", estado='creado', monto=Decimal("100.00"))
        
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                pass

        # Side effects: oauth token -> capture payment (failed status)
        mock_post.side_effect = [
            MockResponse({"access_token": "mock-token-abc"}, 200),
            MockResponse({"id": "MOCK-ORD-FAIL", "status": "FAILED"}, 400)
        ]

        self.client.force_authenticate(user=self.user1)
        url = reverse('pago-capturar', kwargs={'order_id': pago.paypal_order_id})
        response = self.client.post(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify transitions: Pago -> fallido, Pedido -> pendiente
        pago.refresh_from_db()
        self.pedido.refresh_from_db()
        self.assertEqual(pago.estado, 'fallido')
        self.assertEqual(self.pedido.estado, 'pendiente')
        
        # Verify stock rollback: stock restored from 10 to 15 (10 + 5 details)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 15)

    def test_crear_orden_unauthorized_fails(self):
        # Force unauthenticated state
        self.client.force_authenticate(user=None)
        response = self.client.post(self.crear_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crear_orden_non_owner_fails(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(self.crear_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
