from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import EmailChangeHistory

class EmailUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='current@example.com',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/update-email/' 


    def test_update_email_success(self):
        response = self.client.post(self.url, {'email': 'new@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'new@example.com')

        history = EmailChangeHistory.objects.filter(user=self.user).first()
        self.assertIsNotNone(history)
        self.assertEqual(history.old_email, 'current@example.com')
        self.assertEqual(history.new_email, 'new@example.com')


    def test_update_email_already_in_use(self):
        User.objects.create_user(
            username='otheruser',
            email='existing@example.com',
            password='password123'
        )
        response = self.client.post(self.url, {'email': 'existing@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'][0], 'This email is already in use.')


    def test_update_email_invalid_format(self):
        response = self.client.post(self.url, {'email': 'invalid-email'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


    def test_update_email_old_email_mismatch(self):
        response = self.client.post(self.url, {'old_email': 'wrong@example.com', 'email': 'new@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_email', response.data)
        self.assertEqual(response.data['old_email'][0], 'Old email does not match our records.')


    def test_update_email_missing_email(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


    def test_update_email_updates_username(self):
        response = self.client.post(self.url, {'email': 'new@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'new@example.com')
        self.assertEqual(self.user.username, 'new@example.com') 
