from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from api.models import User, UserEstimates

class DeleteEstimateAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client = APIClient()
        self.client.login(username='testuser', password='testpassword')

        self.estimate = UserEstimates.objects.create(user=self.user, estimate_id='EST-0001')

    def test_delete_user_estimate(self):
        response = self.client.delete(f'/api/delete-estimate/{self.estimate.estimate_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserEstimates.objects.filter(estimate_id='EST-0001').exists())

    def test_delete_estimate_not_owned(self):
        other_user = User.objects.create_user(username='otheruser', password='otherpassword')
        other_estimate = UserEstimates.objects.create(user=other_user, estimate_id='EST-0002')

        response = self.client.delete(f'/api/delete-estimate/{other_estimate.estimate_id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(UserEstimates.objects.filter(estimate_id='EST-0002').exists())