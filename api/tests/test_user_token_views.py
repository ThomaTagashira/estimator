from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import UserToken
from freezegun import freeze_time

@freeze_time("2000-02-01T00:00:00Z")
class TestUserTokens(APITestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.tokens = UserToken.objects.create(
            user=self.user,
            token_balance='1',
        )


    def test_get_user_tokens(self):
        self.url = reverse('get_user_token_count')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data['token_balance'], 1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_deduct_tokens_success(self):
        self.url = reverse('deduct_tokens')
        
        response = self.client.post(self.url, {'tokens': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response_data = response.json()
        self.assertEqual(response_data['new_token_balance'], 0)
        
        self.tokens.refresh_from_db()
        self.assertEqual(self.tokens.token_balance, 0)


    def test_deduct_tokens_insufficient(self):
        self.url = reverse('deduct_tokens')
        
        response = self.client.post(self.url, {'tokens': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        response_data = response.json()
        self.assertEqual(response_data['error'], 'Insufficient tokens')
        
        self.tokens.refresh_from_db()
        self.assertEqual(self.tokens.token_balance, 1)


    def test_deduct_tokens_user_token_not_found(self):
        self.tokens.delete()
        
        self.url = reverse('deduct_tokens')
        
        response = self.client.post(self.url, {'tokens': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        response_data = response.json()
        self.assertEqual(response_data['error'], 'Token balance not found')

