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

    @patch('api.views.process_job_scope')  # Mock process_job_scope if it involves external logic
    def test_post_request_with_valid_job_scope(self, mock_process_job_scope):
        # Mock the return value of process_job_scope
        mock_process_job_scope.return_value = Response({'result': 'success'}, status=status.HTTP_200_OK)
        # This should match the structure your React component sends
        data = {'job_scope': { 'key': 'value' }}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_process_job_scope.assert_called_once_with({'key': 'value'})  # Ensure the mock was called with the correct data

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


class UploadPhotoViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('photo_submission')

    def test_post_request_with_valid_photo(self):
        image_path = os.path.join(os.path.dirname(__file__), 'testAssets', 'testPhoto.jpg')

        with open(image_path, 'rb') as image_file:

            photo = SimpleUploadedFile(image_file.name, image_file.read(), content_type="image/jpg")
            data = {'photo': photo}
            response = self.client.post(self.url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_request_without_photo(self):
        data = {}
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'No photo provided')

    def test_get_request(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(response.data['message'], 'Send a POST request with a Photo')

    @patch('api.views.image_to_text')
    def test_post_request_with_invalid_photo_format(self, mock_image_to_text):
        # Mock image_to_text to return None or an invalid response to simulate failure
        mock_image_to_text.return_value = None
        # Simulate invalid file type e.g: txt
        text_file = SimpleUploadedFile("test_image.txt", b"file_content", content_type="text/plain")
        data = {'photo': text_file}

        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('api.views.image_to_text')
    def test_post_request_with_valid_photo(self, mock_image_to_text):
        # Simulate Success
        mock_image_to_text.return_value = {
            'line_1': 'Mock1',
            'line_2': 'Mock2'
        }

        photo = SimpleUploadedFile("test_image.jpeg", b"image_content", content_type="image/jpeg")
        data = {'photo': photo}


class GoogleLoginViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/google/'

    def test_missing_authorization_code(self):
        response = self.client.post(self.url, data={})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Authorization code is missing')

    @patch('api.views.requests.post')
    def test_google_oauth_error(self, mock_post):
        # Mocking Google response to simulate error
        mock_post.return_value.status_code = 400
        mock_post.return_value.json.return_value = {'error': 'invalid_grant'}

        response = self.client.post(self.url, data={'code': 'invalid_code'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'invalid_grant')

    @patch('api.views.requests.post')
    def test_successful_token_retrieval(self, mock_post):
        # Mocking successful token exchange
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'access_token': 'mock_access_token',
            'id_token': 'mock_id_token'
        }

        response = self.client.post(self.url, data={'code': 'valid_code'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['access_token'], 'mock_access_token')
        self.assertEqual(response.data['id_token'], 'mock_id_token')


class GitHubLoginViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/github/'

    def test_missing_authorization_code(self):
        response = self.client.post(self.url, data={})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Authorization code is missing')

    @patch('api.views.requests.post')
    def test_github_oauth_error(self, mock_post):
        # Mock to simulate an error
        mock_post.return_value.status_code = 400
        mock_post.return_value.json.return_value = {'error': 'bad_verification_code', 'error_description': 'The code passed is incorrect or expired.'}

        response = self.client.post(self.url, data={'code': 'invalid_code'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'The code passed is incorrect or expired.')

    @patch('api.views.requests.post')
    def test_successful_token_retrieval(self, mock_post):
        # Mock to simulate successful token exchange
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'access_token': 'mock_access_token'
        }

        response = self.client.post(self.url, data={'code': 'valid_code'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['access_token'], 'mock_access_token')
