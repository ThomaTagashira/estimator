from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import UserEstimates, ClientData, ProjectData

class CreateEstimateTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('create_estimate')

        self.valid_payload = {
            'client': {
                'clientName': 'John Doe',
                'clientAddress': '123 Main St',
                'clientPhone': '555-555-5555',
                'clientEmail': 'johndoe@example.com'
            },
            'project': {
                'projectName': 'New Project',
                'projectLocation': '456 Elm St',
                'startDate': '2024-01-01',
                'endDate': '2024-02-01'
            }
        }

    def test_create_estimate_success(self):
        response = self.client.post(self.url, self.valid_payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        estimate = UserEstimates.objects.get(user=self.user)
        self.assertIsNotNone(estimate)

        client_data = ClientData.objects.get(estimate=estimate)
        self.assertEqual(client_data.client_name, 'John Doe')

        project_data = ProjectData.objects.get(estimate=estimate)
        self.assertEqual(project_data.project_name, 'New Project')

        response_data = response.json()
        self.assertEqual(response_data['estimate_id'], estimate.estimate_id)
        self.assertEqual(response_data['client_name'], 'John Doe')
        self.assertEqual(response_data['project_name'], 'New Project')


    def test_create_estimate_unauthenticated(self):
        self.client.credentials()  # Clears the token
        
        response = self.client.post(self.url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
