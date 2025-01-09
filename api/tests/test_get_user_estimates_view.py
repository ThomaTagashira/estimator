from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import UserEstimates
from freezegun import freeze_time

@freeze_time("2000-02-01T00:00:00Z")
class GetUserEstimatesTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('user_estimates')

        self.estimate1 = UserEstimates.objects.create(
            user=self.user,
            estimate_id='000001',
            project_name='Project Alpha'
        )
        self.estimate2 = UserEstimates.objects.create(
            user=self.user,
            estimate_id='000002',
            project_name='Project Beta'
        )
        self.estimate3 = UserEstimates.objects.create(
            user=self.user,
            estimate_id='000003',
            project_name='Project Gamma'
        )

    def test_get_existing_estimate(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data['estimates']), 3)  
        self.assertEqual(response_data['estimates'][0]['estimate_id'], '000001')
        self.assertEqual(response_data['estimates'][0]['project_name'], 'Project Alpha')
        self.assertEqual(response_data['total'], 3)  

    def test_search_by_estimate_id(self):
        response = self.client.get(self.url, {'search': '000001'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data['estimates']), 1) 
        self.assertEqual(response_data['estimates'][0]['estimate_id'], '000001')
        self.assertEqual(response_data['estimates'][0]['project_name'], 'Project Alpha')

    def test_search_by_project_name(self):
        response = self.client.get(self.url, {'search': 'Beta'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data['estimates']), 1)  
        self.assertEqual(response_data['estimates'][0]['estimate_id'], '000002')
        self.assertEqual(response_data['estimates'][0]['project_name'], 'Project Beta')

    def test_pagination_limit(self):
        response = self.client.get(self.url, {'limit': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data['estimates']), 2)  
        self.assertEqual(response_data['total'], 3)  
        self.assertEqual(response_data['total_pages'], 2) 

    def test_pagination_offset(self):
        response = self.client.get(self.url, {'limit': 2, 'offset': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data['estimates']), 1)  
        self.assertEqual(response_data['estimates'][0]['estimate_id'], '000003')
        self.assertEqual(response_data['estimates'][0]['project_name'], 'Project Gamma')

    def test_search_with_pagination(self):
        response = self.client.get(self.url, {'search': 'Project', 'limit': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data['estimates']), 2)  
        self.assertEqual(response_data['total'], 3)  
        self.assertEqual(response_data['total_pages'], 2) 
