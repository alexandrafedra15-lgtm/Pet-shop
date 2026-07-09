from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from usuarios.models import Usuario

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'password123',
            'telefono': '987654321'
        }

    def test_register_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertEqual(response.data['telefono'], self.user_data['telefono'])
        
        # Verify user is created in database
        self.assertTrue(Usuario.objects.filter(email=self.user_data['email']).exists())

    def test_register_duplicate_email(self):
        # Register user once
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Register user again with the same email
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_login_success(self):
        # Register user
        Usuario.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
            telefono=self.user_data['telefono']
        )

        # Try logging in
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertEqual(response.data['telefono'], self.user_data['telefono'])
        self.assertEqual(response.data['id'], Usuario.objects.get(email=self.user_data['email']).id)

    def test_login_invalid_password(self):
        # Register user
        Usuario.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password']
        )

        # Try logging in with wrong password
        login_data = {
            'email': self.user_data['email'],
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
