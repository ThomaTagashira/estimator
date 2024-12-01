from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from api.models import SearchResponseData, UserEstimates

class SaveSearchResponseViewTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
        self.estimate = UserEstimates.objects.create(user=self.user, estimate_id="EST-0001")
        self.url = f'/api/save-search-responses/{self.estimate.estimate_id}/'

    def test_save_search_responses_success(self):
        data = {
            'search_responses': [
                {'task': 'Task 1'},
                {'task': 'Task 2'}
            ]
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SearchResponseData.objects.count(), 2)

        saved_responses = SearchResponseData.objects.filter(estimate=self.estimate)
        for idx, response in enumerate(saved_responses, start=1):
            self.assertEqual(response.saved_response_id, idx)





class RetrieveSearchResponseViewTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
        self.estimate = UserEstimates.objects.create(user=self.user, estimate_id="EST-0001")
        SearchResponseData.objects.create(user=self.user, estimate=self.estimate, task="Task 1", saved_response_id=1)
        SearchResponseData.objects.create(user=self.user, estimate=self.estimate, task="Task 2", saved_response_id=2)
        self.url = f'/api/get-search-responses/{self.estimate.estimate_id}/'

    def test_retrieve_search_responses_success(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_tasks = [
            {'task': 'Task 1', 'saved_response_id': 1},
            {'task': 'Task 2', 'saved_response_id': 2}
        ]
        self.assertEqual(response.data['tasks'], expected_tasks)





class DeleteSearchResponseViewTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
        self.estimate = UserEstimates.objects.create(user=self.user, estimate_id="EST-0001")
        self.search_response = SearchResponseData.objects.create(
            user=self.user,
            estimate=self.estimate,
            task="Task 1",
            saved_response_id=1
        )
        self.url = f'/api/delete-search-response/{self.estimate.estimate_id}/{self.search_response.saved_response_id}/'

    def test_delete_search_response_success(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(SearchResponseData.objects.count(), 0)

    def test_delete_nonexistent_search_response(self):
        invalid_url = f'/api/delete-search-response/{self.estimate.estimate_id}/999/'
        response = self.client.delete(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
