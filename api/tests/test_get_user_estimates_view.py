
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_user_estimates(request):
#     user = request.user
#     estimates = UserEstimates.objects.filter(user=user)
#     serializer = UserEstimatesSerializer(estimates, many=True)
#     return Response(serializer.data)


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
        UserEstimates.objects.create(
            user=self.user,
            estimate_id='000001',
            project_name='test project'
        )


    def test_get_existing_estimate(self):

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data[0]['estimate_id'], '000001')
        self.assertEqual(response_data[0]['project_name'], 'test project')
        self.assertEqual(response_data[0]['date_created'], '2000-02-01T00:00:00Z')
        self.assertEqual(response_data[0]['last_modified'], '2000-02-01T00:00:00Z')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
