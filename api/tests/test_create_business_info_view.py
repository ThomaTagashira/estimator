from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import BusinessInfo

class CreateBusinessInfoTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('save_business_info')

        self.business_data = {
            'business_name': 'test business name',
            'business_address': '1800 test address, testing, NA. 11111',
            'business_phone': '111-111-1111',
            'business_email': 'testbusinessemail@test.com'
        }

    def test_create_BusinessInfo_success(self):
        response = self.client.post(self.url, self.business_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        saved_business = BusinessInfo.objects.get(user=self.user)
        self.assertEqual(saved_business.business_name, 'test business name')
        self.assertEqual(saved_business.business_address, '1800 test address, testing, NA. 11111')
        self.assertEqual(saved_business.business_phone, '111-111-1111')
        self.assertEqual(saved_business.business_email, 'testbusinessemail@test.com')

        response_data = response.json()
        self.assertEqual(response_data['business_name'], 'test business name')
        self.assertEqual(response_data['business_address'], '1800 test address, testing, NA. 11111')
        self.assertEqual(response_data['business_phone'], '111-111-1111')
        self.assertEqual(response_data['business_email'], 'testbusinessemail@test.com')