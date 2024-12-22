from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from ..models import EstimateMarginData, UserEstimates
from rest_framework.authtoken.models import Token

class EstimateMarginViewsTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.estimate = UserEstimates.objects.create(
            user=self.user,
            estimate_id='00001',
            project_name='test project'
        )

        self.estimate_margin = EstimateMarginData.objects.create(
            user=self.user, 
            estimate=self.estimate,
            margin_percent=10, 
            tax_percent=5, 
            discount_percent=2
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.save_url = '/api/save-estimate-margin/'
        self.get_url = f'/api/get-estimate-margin/{self.estimate.estimate_id}/'



    def test_save_or_update_unauthenticated(self):
        unauthenticated_client = APIClient()
        response = unauthenticated_client.post(self.save_url, {
            'estimate_id': self.estimate.estimate_id,
            'margin_percent': 10,
            'tax_percent': 5,
            'discount_percent': 2
        })
        self.assertEqual(response.status_code, 401)



    def test_save_or_update_create_new_record(self):
        self.estimate_margin.delete()

        data = {
            'estimate_id': self.estimate.estimate_id,
            'margin_percent': 15,
            'tax_percent': 8,
            'discount_percent': 3
        }

        response = self.client.post(self.save_url, data)
        self.assertEqual(response.status_code, 200)

        record = EstimateMarginData.objects.get(estimate=self.estimate, user=self.user)
        self.assertEqual(record.margin_percent, 15)
        self.assertEqual(record.tax_percent, 8)
        self.assertEqual(record.discount_percent, 3)



    def test_save_or_update_update_existing_record(self):
        data = {
            'estimate_id': self.estimate.estimate_id,
            'margin_percent': 20,
            'tax_percent': 10,
            'discount_percent': 5
        }
        response = self.client.post(self.save_url, data)
        self.assertEqual(response.status_code, 200)

        record = EstimateMarginData.objects.get(estimate=self.estimate, user=self.user)
        self.assertEqual(record.margin_percent, 20)
        self.assertEqual(record.tax_percent, 10)
        self.assertEqual(record.discount_percent, 5)



    def test_save_or_update_default_to_zero(self):
        data = {
            'estimate_id': self.estimate.estimate_id,
            'margin_percent': "",
            'tax_percent': "",
            'discount_percent': ""
        }
        response = self.client.post(self.save_url, data)
        self.assertEqual(response.status_code, 200)

        record = EstimateMarginData.objects.get(estimate=self.estimate, user=self.user)
        self.assertEqual(record.margin_percent, 0)
        self.assertEqual(record.tax_percent, 0)
        self.assertEqual(record.discount_percent, 0)



    def test_get_unauthenticated(self):
        unauthenticated_client = APIClient()
        response = unauthenticated_client.get(self.get_url)
        self.assertEqual(response.status_code, 401)



    def test_get_no_record_exists(self):
        self.estimate_margin.delete()

        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {
            'margin_percent': 0,
            'tax_percent': 0,
            'discount_percent': 0
        })



    def test_get_existing_record(self):
        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {
            'margin_percent': 10,
            'tax_percent': 5,
            'discount_percent': 2
        })



    def test_get_record_with_partial_data(self):
        self.estimate_margin.margin_percent = 25
        self.estimate_margin.tax_percent = None
        self.estimate_margin.discount_percent = None
        self.estimate_margin.save()

        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {
            'margin_percent': 25,
            'tax_percent': 0,
            'discount_percent': 0
        })
