from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

class HandleScopeViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('handle_scope')  # Adjust this to the actual name of your URL pattern

    def test_post_request_with_valid_job_scope(self):
        # Assuming process_job_scope(job_scope) returns a valid response
        data = {'job_scope': 'some_scope_data'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Further assertions can be made here based on the expected output from process_job_scope

    def test_post_request_with_valid_line(self):
        # Assuming process_line(Line) returns a valid response
        data = {'Line': 'some_line_data'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Further assertions can be made here based on the expected output from process_line

    def test_post_request_with_missing_data(self):
        data = {}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid or missing input data')

    def test_get_request(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(response.data['message'], 'Send a POST request with either job_scope or line parameter')

    def test_unsupported_request_method(self):
        response = self.client.put(self.url)  # Testing with an unsupported method (PUT in this case)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(response.data['error'], 'Invalid request method')
