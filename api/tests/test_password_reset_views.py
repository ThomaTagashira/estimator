from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator


class PasswordResetRequestTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.url = '/api/password-reset/'

    def test_password_reset_request_valid_email(self):
        data = {'email': 'testuser@example.com'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_password_reset_request_invalid_email(self):
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  

    def test_password_reset_request_invalid_format(self):
        data = {'email': 'invalid-email'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_request_empty_email(self):
        data = {'email': ''}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_password_reset_request_inactive_user(self):
        data = {'email': 'inactiveuser@example.com'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK) 


class PasswordResetConfirmTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = default_token_generator.make_token(self.user)
        self.url = '/api/password-reset-confirm/'

    def test_password_reset_confirm_valid_data(self):
        data = {'uid': self.uid, 'token': self.token, 'new_password': 'newpassword123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_password_reset_confirm_invalid_token(self):
        data = {'uid': self.uid, 'token': 'invalid-token', 'new_password': 'newpassword123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_invalid_uid(self):
        data = {'uid': 'invalid-uid', 'token': self.token, 'new_password': 'newpassword123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)



    # def test_password_reset_confirm_new_password_too_short(self):
    #     data = {'uid': self.uid, 'token': self.token, 'new_password': 'short'}
    #     response = self.client.post(self.url, data)
    #     print(response.data)  
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("new_password", response.data)

    # def test_password_reset_confirm_new_password_matches_old_password(self):
    #     data = {'uid': self.uid, 'token': self.token, 'new_password': 'password123'}
    #     response = self.client.post(self.url, data)
    #     print(response.data)  
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("new_password", response.data)

    # def test_password_reset_confirm_missing_uid(self):
    #     data = {'token': self.token, 'new_password': 'newpassword123'}
    #     response = self.client.post(self.url, data)
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('uid', response.data)

    # def test_password_reset_confirm_missing_token(self):
    #     data = {'uid': self.uid, 'new_password': 'newpassword123'}
    #     response = self.client.post(self.url, data)
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('token', response.data)

    # def test_password_reset_confirm_missing_new_password(self):
    #     data = {'uid': self.uid, 'token': self.token}
    #     response = self.client.post(self.url, data)
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('new_password', response.data)


class PasswordUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        self.url = '/api/update-password/'

    def test_password_update_valid(self):
        data = {'current_password': 'password123', 'new_password': 'newpassword123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_password_update_incorrect_current_password(self):
        data = {'current_password': 'wrongpassword', 'new_password': 'newpassword123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('current_password', response.data)

    def test_password_update_new_password_too_short(self):
        data = {'current_password': 'password123', 'new_password': 'short'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)

    def test_password_update_missing_new_password(self):
        data = {'current_password': 'password123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)
