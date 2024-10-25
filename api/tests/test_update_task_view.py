from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import EstimateItems, UserEstimates
from django.db.models import Max

class UpdateTaskTestCase(APITestCase): 
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.estimate = UserEstimates.objects.create(
            user=self.user,
            estimate_id='000001',
            project_name='test project'
        )    

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
        
            saved_tasks = EstimateItems.objects.create(
                user=self.user,
                estimate=self.estimate,
                task_number=current_max_task_number,
                task_description=task_description
            )
        
        self.url = reverse('delete_task', kwargs={'estimate_id': self.estimate.id, 'task_number': saved_tasks.task_number})
 
    def test_update_existing_estimate_items(self):

        # Update task 1
        updated_task_1 = {
            'task_description': 'updated job1 Labor Cost: $11.11 Material Cost: $11.11'
        }
        url_task_1 = reverse('update_task', kwargs={'estimate_id': self.estimate.id, 'task_number': 1})
        response = self.client.patch(url_task_1, updated_task_1, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Update task 2
        updated_task_2 = {
            'task_description': 'updated job2 Labor Cost: $22.22 Material Cost: $22.22'
        }
        url_task_2 = reverse('update_task', kwargs={'estimate_id': self.estimate.id, 'task_number': 2})
        response = self.client.patch(url_task_2, updated_task_2, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Update task 3
        updated_task_3 = {
            'task_description': 'updated job3 Labor Cost: $33.33 Material Cost: $33.33'
        }
        url_task_3 = reverse('update_task', kwargs={'estimate_id': self.estimate.id, 'task_number': 3})
        response = self.client.patch(url_task_3, updated_task_3, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        fetch_url = reverse('get_saved_estimate_items', kwargs={'estimate_id': self.estimate.id})
        response = self.client.get(fetch_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data[0]['task_number'], 1)
        self.assertEqual(response_data[0]['task_description'], 'updated job1 Labor Cost: $11.11 Material Cost: $11.11')

        self.assertEqual(response_data[1]['task_number'], 2)
        self.assertEqual(response_data[1]['task_description'], 'updated job2 Labor Cost: $22.22 Material Cost: $22.22')

        self.assertEqual(response_data[2]['task_number'], 3)
        self.assertEqual(response_data[2]['task_description'], 'updated job3 Labor Cost: $33.33 Material Cost: $33.33')
