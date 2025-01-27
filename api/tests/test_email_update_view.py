from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from itsdangerous import URLSafeTimedSerializer
from django.conf import settings
from urllib.parse import urlparse, parse_qsl

serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

def generate_email_update_verification_token(old_email, new_email):
    return serializer.dumps({'old_email': old_email, 'new_email': new_email}, salt='email-verify-salt')

class ConfirmEmailChangeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='current@example.com',
            email='current@example.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.user)

        self.valid_token = generate_email_update_verification_token(
            old_email='current@example.com', 
            new_email='new@example.com'
        )
        self.invalid_token = "invalid-token"
        self.mismatch_token = generate_email_update_verification_token(
            old_email='mismatch@example.com', 
            new_email='new@example.com'
        )
        self.url = f'/api/confirm-user-updated-email/{self.valid_token}/'

    def test_confirm_email_change_invalid_token(self):
        url = f'/api/confirm-user-updated-email/{self.invalid_token}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, f"{settings.FRONTEND_URI}/verify-email-failed")

    def test_confirm_email_change_missing_token(self):
        url = '/api/confirm-user-updated-email/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_confirm_email_change_token_mismatch(self):
        url = f'/api/confirm-user-updated-email/{self.mismatch_token}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, f"{settings.FRONTEND_URI}/verify-email-failed")

    def test_confirm_email_change_success(self):
        url = f'/api/confirm-user-updated-email/{self.valid_token}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'new@example.com')
        self.assertEqual(self.user.username, 'new@example.com')

        parsed_url = urlparse(response.url)
        query_params = dict(parse_qsl(parsed_url.query))
        self.assertIn('verify-user-email-success', response.url)
        self.assertEqual(query_params.get('success'), 'True')
        self.assertEqual(query_params.get('email'), 'new@example.com')



class EmailUpdateTriggerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='current@example.com',
            email='current@example.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/update-email/' 

    def test_trigger_verification_email_success(self):
        response = self.client.post(self.url, {'email': 'new@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Verification email sent. Please confirm your new email.')
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'current@example.com')  

    def test_trigger_verification_email_already_in_use(self):
        User.objects.create_user(
            username='otheruser',
            email='existing@example.com',
            password='Password123!'
        )
        response = self.client.post(self.url, {'email': 'existing@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'][0], 'This email is already in use.')

    def test_trigger_verification_email_invalid_format(self):
        response = self.client.post(self.url, {'email': 'invalid-email'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_trigger_verification_email_missing_email(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
