# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_saved_estimate(request, estimate_id):
#     try:
#         estimate = UserEstimates.objects.prefetch_related('client_data', 'project_data').get(estimate_id=estimate_id, user=request.user)
#         serializer = UserEstimatesSerializer(estimate)
#         return Response(serializer.data)
#     except UserEstimates.DoesNotExist:
#         return Response({'error': 'Estimate not found'}, status=404)

from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import UserEstimates, ClientData, ProjectData
from freezegun import freeze_time

@freeze_time("2000-02-01T00:00:00Z")
class GetSavedEstimateTestCase(APITestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        # Create the UserEstimates object
        self.estimate = UserEstimates.objects.create(
            user=self.user,
            estimate_id='000001',
            project_name='test project'
        )    

        # Create related ClientData and ProjectData
        ClientData.objects.create(
            user=self.user,
            estimate=self.estimate,
            client_name='John Doe',
            client_address='123 Main St',
            client_phone='555-555-5555',
            client_email='johndoe@example.com'
        )
        
        ProjectData.objects.create(
            user=self.user,
            estimate=self.estimate,
            project_name='New Project',
            project_location='Test Location'
        )

        # Set the correct URL for retrieving the estimate
        self.url = reverse('get_estimate', kwargs={'estimate_id': self.estimate.estimate_id})


def test_get_saved_estimate(self):
    # Send a GET request to retrieve the saved estimate
    response = self.client.get(self.url)
    self.assertEqual(response.status_code, status.HTTP_200_OK)

    response_data = response.json()

    self.assertEqual(response_data['estimate_id'], '000001')
    self.assertEqual(response_data['project_name'], 'test project')
    self.assertEqual(response_data['date_created'], '2000-02-01T00:00:00Z')
    self.assertEqual(response_data['last_modified'], '2000-02-01T00:00:00Z')

    # ClientData
    self.assertEqual(response_data['client_name'], 'John Doe')
    self.assertEqual(response_data['client_address'], '123 Main St')
    self.assertEqual(response_data['clientPhone'], '555-555-5555')
    self.assertEqual(response_data['clientEmail'], 'johndoe@example.com')

    # ProjectData
    self.assertEqual(response_data['project_name'], 'New Project')
    self.assertEqual(response_data['projectLocation'], 'Test Location')
