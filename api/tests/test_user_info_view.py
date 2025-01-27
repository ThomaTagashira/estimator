from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from ..models import UserInfo

class UserInfoTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='password123',
            email='testuser@example.com'
        )
        self.user_info = UserInfo.objects.create(
            user=self.user,
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            zipcode='12345'
        )
        self.client.login(username='testuser', password='password123')

    def test_get_user_info(self):
        response = self.client.get('/api/get-user-profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertEqual(response.data['phone_number'], '1234567890')
        self.assertEqual(response.data['zipcode'], '12345')

    def test_patch_update_first_name(self):
        response = self.client.patch('/api/get-user-profile/', {'first_name': 'Updated'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_info.refresh_from_db()
        self.assertEqual(self.user_info.first_name, 'Updated')
        self.assertEqual(self.user_info.last_name, 'User')  

    def test_patch_update_multiple_fields(self):
        response = self.client.patch('/api/get-user-profile/', {
            'first_name': 'Updated',
            'phone_number': '9876543210'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_info.refresh_from_db()
        self.assertEqual(self.user_info.first_name, 'Updated')
        self.assertEqual(self.user_info.phone_number, '9876543210')

    def test_patch_update_invalid_phone_number(self):
        response = self.client.patch('/api/get-user-profile/', {'phone_number': 'invalid'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone_number', response.data)

    def test_patch_update_nonexistent_user_info(self):
        new_user = User.objects.create_user(
            username='nouserinfo',
            password='password123',
            email='nouserinfo@example.com'
        )
        self.client.login(username='nouserinfo', password='password123')
        response = self.client.patch('/api/get-user-profile/', {'first_name': 'ShouldFail'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
