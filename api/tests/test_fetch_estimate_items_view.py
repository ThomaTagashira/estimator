from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import EstimateItems, UserEstimates
from django.db.models import Max

class FetchEstimateItemsTestCase(APITestCase): 
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.estimate = UserEstimates.objects.create(
            user=self.user,
            estimate_id='000001',
            project_name='test project'
        )

        self.url = reverse('get_saved_estimate_items', kwargs={'estimate_id': self.estimate.estimate_id})
        
        tasks_to_save = [
            {'job': 'job1', 'laborCost': '1.11', 'materialCost': '1.11'},
            {'job': 'job2', 'laborCost': '2.22', 'materialCost': '2.22'},
            {'job': 'job3', 'laborCost': '3.33', 'materialCost': '3.33'}
        ]

        current_max_task_number = EstimateItems.objects.filter(estimate='000001').aggregate(
            max_task_number=Max('task_number')
        )['max_task_number'] or 0

        for task in tasks_to_save:
            current_max_task_number += 1
            task_description = f"{task['job']} Labor Cost: ${task['laborCost']} Material Cost: ${task['materialCost']}"
        
            EstimateItems.objects.create(
                user=self.user,
                estimate=self.estimate,
                task_number=current_max_task_number,
                task_description=task_description
            )

    def test_get_existing_estimate_items(self):

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data[0]['task_number'], 1)
        self.assertEqual(response_data[0]['task_description'], 'job1 Labor Cost: $1.11 Material Cost: $1.11')

        self.assertEqual(response_data[1]['task_number'], 2)
        self.assertEqual(response_data[1]['task_description'], 'job2 Labor Cost: $2.22 Material Cost: $2.22')

        self.assertEqual(response_data[2]['task_number'], 3)
        self.assertEqual(response_data[2]['task_description'], 'job3 Labor Cost: $3.33 Material Cost: $3.33')

        
