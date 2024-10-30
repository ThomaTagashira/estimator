from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APIClient

class GoogleLoginViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/google/'  # Ensure this matches your URL pattern

    def test_missing_authorization_code(self):
        response = self.client.post(self.url, data={})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Authorization code is missing')

    @patch('api.views.requests.post')
    def test_google_oauth_error(self, mock_post):
        # Mocking Google response to simulate error
        mock_post.return_value.status_code = 400
        mock_post.return_value.json.return_value = {'error': 'invalid_grant'}

        response = self.client.post(self.url, data={'code': 'invalid_code'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'invalid_grant')

    @patch('api.views.requests.get')
    @patch('api.views.requests.post')
    def test_successful_token_retrieval(self, mock_post, mock_get):
        # Mocking successful token exchange response
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'access_token': 'mock_access_token',
            'id_token': 'mock_id_token'
        }

        # Mocking successful user info retrieval
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'email': 'testuser@example.com'
        }

        response = self.client.post(self.url, data={'code': 'valid_code'})

        # Check only for tokens and subscription status in the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('has_active_subscription', response.data)
