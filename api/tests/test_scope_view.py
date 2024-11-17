from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch  # Thingy to mock external dependencies
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.response import Response
import os

class HandleScopeViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('scope')

    @patch('api.views.process_job_scope')  
    def test_post_request_with_valid_job_scope(self, mock_process_job_scope):
        mock_process_job_scope.return_value = Response({'result': 'success'}, status=status.HTTP_200_OK)

        data = {'job_scope': { 'key': 'value' }}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_process_job_scope.assert_called_once_with({'key': 'value'})  

    @patch('api.views.process_line')
    def test_post_request_with_valid_line(self, mock_process_line):
        mock_process_line.return_value = Response({'result': 'success'}, status=status.HTTP_200_OK)

        data = {'Line': 'some_line_data'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_process_line.assert_called_once_with('some_line_data')

    def test_post_request_with_missing_data(self):
        data = {}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid or missing input data')

    def test_get_request(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(response.data['message'], 'Send a POST request with either job_scope or line parameter')