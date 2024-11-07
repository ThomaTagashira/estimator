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

        self.delete_url = reverse('delete_task', kwargs={'estimate_id': self.estimate.estimate_id, 'task_number': saved_tasks.task_number})

    def test_delete_task(self):

        # Send DELETE request to remove the first task
        response = self.client.delete(self.delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)  # Typically a 204 is returned for delete

        # Check if task number 1 was deleted
        task_exists = EstimateItems.objects.filter(estimate=self.estimate, task_number=3).exists()
        self.assertFalse(task_exists)  # Assert that the task no longer exists

