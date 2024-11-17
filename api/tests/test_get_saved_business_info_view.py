from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import BusinessInfo


class SaveBusinessInfoTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('get_saved_business_info')
        self.business = BusinessInfo.objects.create(
            user=self.user,
            business_name='test name',
            business_address='test addy',
            business_phone='111-111-1111',
            business_email='testemail@test.com'
        )


    def test_get_business_info(self):
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data[0]['business_name'], 'test name')
        self.assertEqual(response_data[0]['business_address'], 'test addy')
        self.assertEqual(response_data[0]['business_phone'], '111-111-1111')
        self.assertEqual(response_data[0]['business_email'], 'testemail@test.com')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
