from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import EstimateItems, UserEstimates
from freezegun import freeze_time
from django.db.models import Max

@freeze_time("2000-02-01T00:00:00Z")
class SaveEstimateItemsTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('save_estimate_items')
        self.estimate = UserEstimates.objects.create(
            user=self.user,
            estimate_id='00001',
            project_name='test project'
        )


    def test_save_estimate_items(self):
        
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
            task_description = f"{task['job']} Labor Cost: ${task['laborCost']} Material Cost: ${task['materialCost']}"
        
            EstimateItems.objects.create(
                user=self.user,
                estimate=self.estimate,
                task_number=current_max_task_number,
                task_description=task_description
            )


