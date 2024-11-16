from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import EstimateItems, UserEstimates
from django.db.models import Max

class DeleteTaskTestCase(APITestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        # Create the estimate
        self.estimate = UserEstimates.objects.create(
            user=self.user,
            estimate_id='00001',
            project_name='test project'
        )

        # Create tasks
        tasks_to_save = [
            {'job': 'job1', 'laborCost': '1.11', 'materialCost': '1.11'},
            {'job': 'job2', 'laborCost': '2.22', 'materialCost': '2.22'},
            {'job': 'job3', 'laborCost': '3.33', 'materialCost': '3.33'}
        ]

        current_max_task_number = EstimateItems.objects.filter(estimate=self.estimate).aggregate(
            max_task_number=Max('task_number')
        )['max_task_number'] or 0

        for task in tasks_to_save:
            current_max_task_number += 1
            EstimateItems.objects.create(
                user=self.user,
                estimate=self.estimate,
                task_number=current_max_task_number,
                task_description=f"{task['job']} Labor Cost: ${task['laborCost']} Material Cost: ${task['materialCost']}"
            )

        self.delete_url = reverse('delete_task', kwargs={
            'estimate_id': self.estimate.estimate_id,
            'task_number': current_max_task_number  # Delete the last task
        })

    def test_delete_task(self):
        # DELETE request
        response = self.client.delete(self.delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify the task was deleted
        task_exists = EstimateItems.objects.filter(estimate=self.estimate, task_number=3).exists()
        self.assertFalse(task_exists)
