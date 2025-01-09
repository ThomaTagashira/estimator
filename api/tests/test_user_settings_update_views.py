from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User

class EmailUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.client.login(username='testuser', password='password123')
        self.url = '/api/update-email/'

    def test_email_update_success(self):
        new_email = 'newemail@example.com'
        response = self.client.post(self.url, {'email': new_email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, new_email)

    def test_email_update_already_in_use(self):
        User.objects.create_user(username='otheruser', email='otheremail@example.com', password='password123')
        response = self.client.post(self.url, {'email': 'otheremail@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_email_update_invalid_email(self):
        response = self.client.post(self.url, {'email': 'invalid-email'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


class PasswordUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.client.login(username='testuser', password='password123')
        self.url = '/api/update-password/'

    def test_password_update_success(self):
        response = self.client.post(self.url, {
            'current_password': 'password123',
            'new_password': 'newpassword456',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword456'))

    def test_password_update_incorrect_current_password(self):
        response = self.client.post(self.url, {
            'current_password': 'wrongpassword',
            'new_password': 'newpassword456',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('current_password', response.data)

    def test_password_update_short_new_password(self):
        response = self.client.post(self.url, {
            'current_password': 'password123',
            'new_password': 'short',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)
