from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from unittest.mock import patch
from ..models import Subscription

class EmailCaseSensitivityTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_email = 'testuser@example.com'
        self.user_password = 'Securepassword123!'
        self.user = User.objects.create_user(
            username='testuser',
            email=self.user_email,
            password=self.user_password
        )


    def test_registration_with_existing_email_different_case(self):
        response = self.client.post('/api/register/', {
            'username': 'anotheruser',
            'userEmail': 'TESTUSER@EXAMPLE.COM',  
            'password': self.user_password
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data) 
        self.assertEqual(response.data['email'], 'Email already in use.')  



    def test_registration_with_existing_email_lowercase(self):
        response = self.client.post('/api/register/', {
            'username': 'anotheruser',
            'userEmail': 'testuser@example.com',  
            'password': self.user_password
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)  
        self.assertEqual(response.data['email'], 'Email already in use.')  



    def test_email_is_normalized_on_registration(self):
        response = self.client.post('/api/register/', {
            'userEmail': 'UPPERCASE@EMAIL.COM', 
            'password': self.user_password
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username='UPPERCASE@EMAIL.COM'.lower())
        self.assertEqual(user.email, 'uppercase@email.com')



class GoogleOAuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.google_oauth_url = '/api/auth/google/'

    @patch('requests.post')
    def test_google_oauth_error(self, mock_post):
        mock_post.return_value.status_code = 400
        mock_post.return_value.json.return_value = {
            'error': 'Invalid token response'
        }

        response = self.client.post('/api/auth/google/', {'code': 'invalid_code'})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'Invalid token response')  



class UsernameTokenObtainPairViewTest(APITestCase):
    def setUp(self):
        self.user_password = 'Securepassword123!'
        self.user_email = 'testuser@example.com'
        
        self.user = User.objects.create_user(
            username=self.user_email,  
            email=self.user_email,
            password=self.user_password,
            is_active=True 
        )

        Subscription.objects.create(
            user=self.user,
            is_active=True,
            profile_completed=True
        )
        self.login_url = '/api/userToken/'

    def test_login_with_case_insensitive_username(self):
        response = self.client.post('/api/userToken/', {
            'username': 'TESTUSER@EXAMPLE.COM',  
            'password': self.user_password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)  

    def test_login_with_different_case_username(self):
        response = self.client.post(self.login_url, {
            'username': 'TESTUSER@example.com',  
            'password': self.user_password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_with_invalid_username(self):
        response = self.client.post(self.login_url, {
            'username': 'nonexistent@example.com',
            'password': self.user_password
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)