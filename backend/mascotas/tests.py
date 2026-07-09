from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from usuarios.models import Usuario
from .models import Mascota

class MascotaTests(APITestCase):
    def setUp(self):
        self.list_create_url = reverse('mascota-list-create')
        self.user1 = Usuario.objects.create_user(
            email='user1@example.com',
            password='password123'
        )
        self.user2 = Usuario.objects.create_user(
            email='user2@example.com',
            password='password123'
        )
        self.pet_data = {
            'nombre': 'Fido',
            'especie': 'perro',
            'raza': 'Golden Retriever',
            'edad': 3
        }

    def test_create_mascota_authenticated(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.list_create_url, self.pet_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Fido')
        self.assertEqual(response.data['usuario'], self.user1.email)

        # Verify in DB
        self.assertEqual(Mascota.objects.count(), 1)
        pet = Mascota.objects.first()
        self.assertEqual(pet.usuario, self.user1)

    def test_create_mascota_unauthenticated(self):
        response = self.client.post(self.list_create_url, self.pet_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Mascota.objects.count(), 0)

    def test_list_mascotas_isolation(self):
        # Create pet for user1
        Mascota.objects.create(
            usuario=self.user1,
            nombre='Fido',
            especie='perro',
            raza='Golden Retriever',
            edad=3
        )
        # Create pet for user2
        Mascota.objects.create(
            usuario=self.user2,
            nombre='Michi',
            especie='gato',
            raza='Siames',
            edad=2
        )

        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_create_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Fido')

        # Authenticate as user2
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.list_create_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Michi')


class BreedAPITests(APITestCase):
    def test_breeds_invalid_species(self):
        url = reverse('razas-list', kwargs={'especie': 'pajaro'})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('requests.get')
    def test_breeds_dog_api_success(self, mock_get):
        # Mock external API response
        mock_response_data = [
            {"id": 1, "name": "Affenpinscher", "life_span": "10 - 12 years"},
            {"id": 2, "name": "Afghan Hound", "life_span": "10 - 13 years"}
        ]
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response_data

        url = reverse('razas-list', kwargs={'especie': 'perro'})
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['nombre'], 'Affenpinscher')
        self.assertEqual(response.data[0]['id'], 1)
        self.assertEqual(response.data[1]['nombre'], 'Afghan Hound')

        # Verify headers were checked and URL was called
        mock_get.assert_called_once_with(
            "https://api.thedogapi.com/v1/breeds",
            headers={'x-api-key': 'live_M07u07celNXUXYc9EMzlkLgX27qEOxlMM581PgfDQbVzNC9JIPj6pRrWJEA85s5h'},
            timeout=10
        )
