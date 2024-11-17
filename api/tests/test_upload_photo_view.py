from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch  # Thingy to mock external dependencies
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.response import Response
import os

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
        mock_image_to_text.return_value = None
        text_file = SimpleUploadedFile("test_image.txt", b"file_content", content_type="text/plain")
        data = {'photo': text_file}

        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('api.views.image_to_text')
    def test_post_request_with_valid_photo(self, mock_image_to_text):
        mock_image_to_text.return_value = {
            'line_1': 'Mock1',
            'line_2': 'Mock2'
        }

        photo = SimpleUploadedFile("test_image.jpeg", b"image_content", content_type="image/jpeg")
        data = {'photo': photo}
