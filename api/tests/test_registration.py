from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from api.models import StripeProfile

class UserRegistrationTest(APITestCase):
    def test_user_registration_and_stripe_customer_creation(self):
        # Define the URL for registration
        url = reverse('register_user')  # Make sure 'register_user' is the name of the URL pattern

        # Define the payload for registration
        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'strong_password_123'
        }

        # Make a POST request to the registration endpoint
        response = self.client.post(url, data, format='json')

        # Check that the response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify that the user has been created
        user = User.objects.get(username='testuser')
        self.assertIsNotNone(user)

        # Verify that a StripeProfile has been created and it has a customer ID
        stripe_profile = StripeProfile.objects.get(user=user)
        self.assertIsNotNone(stripe_profile.stripe_customer_id)
