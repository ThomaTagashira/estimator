from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from api.models import StripeProfile

class UserRegistrationTest(APITestCase):
    def test_user_registration_and_stripe_customer_creation(self):
        url = reverse('register_user')  

        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'strong_password_123'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username='testuser')
        self.assertIsNotNone(user)

        stripe_profile = StripeProfile.objects.get(user=user)
        self.assertIsNotNone(stripe_profile)
